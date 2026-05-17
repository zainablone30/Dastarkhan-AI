-- ============================================================
-- Notifications table + order status trigger
-- Run this in Supabase SQL editor
-- ============================================================

-- 1. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text        NOT NULL,
  order_id   uuid,
  type       text        NOT NULL DEFAULT 'order_status',
  status     text,
  title      text        NOT NULL,
  detail     text,
  is_read    boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);

-- 2. RLS (adjust for production if needed)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (auth.uid()::text = user_id);

-- 3. Trigger for order status changes
CREATE OR REPLACE FUNCTION public.insert_order_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  n_title text;
  n_detail text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    n_title := 'Order placed';
    n_detail := COALESCE(NEW.restaurant_name, 'Your order') || ' is pending confirmation.';
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    CASE NEW.status
      WHEN 'pending' THEN
        n_title := 'Order pending';
        n_detail := 'We received your order and are confirming it.';
      WHEN 'confirmed' THEN
        n_title := 'Order confirmed';
        n_detail := 'Your order has been confirmed by the restaurant.';
      WHEN 'preparing' THEN
        n_title := 'Order preparing';
        n_detail := 'The kitchen has started preparing your order.';
      WHEN 'on_the_way' THEN
        n_title := 'Order on the way';
        n_detail := 'Your rider is on the way to you.';
      WHEN 'delivered' THEN
        n_title := 'Order delivered';
        n_detail := 'Enjoy your meal. Please rate your order.';
      WHEN 'cancelled' THEN
        n_title := 'Order cancelled';
        n_detail := 'Your order has been cancelled.';
      ELSE
        n_title := 'Order update';
        n_detail := 'Your order status was updated.';
    END CASE;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, order_id, type, status, title, detail)
  VALUES (NEW.user_id, NEW.id, 'order_status', NEW.status, n_title, n_detail);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_notify ON public.orders;
CREATE TRIGGER orders_notify
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.insert_order_notification();

-- 4. Enable realtime on notifications
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END; $$;

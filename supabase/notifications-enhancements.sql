-- ============================================================
-- Notification enhancements: broadcast + welcome + new dish/restaurant
-- Run AFTER create-notifications-table.sql in Supabase SQL editor
-- ============================================================

-- 1. Add image_url column (optional, for rich notifications)
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Broadcast index (for fetching broadcasts efficiently)
CREATE INDEX IF NOT EXISTS notifications_broadcast_idx ON public.notifications(user_id) WHERE user_id = 'broadcast';

-- 3. Update SELECT RLS: allow reading own + broadcast notifications
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_own_or_broadcast" ON public.notifications;
CREATE POLICY "notifications_select_own_or_broadcast" ON public.notifications
  FOR SELECT USING (
    auth.uid()::text = user_id
    OR user_id = 'broadcast'
  );

-- INSERT still requires own user_id (triggers bypass RLS via SECURITY DEFINER)
DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- DELETE only own (broadcasts cannot be deleted by users — handled client-side)
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (auth.uid()::text = user_id);

-- UPDATE own (for marking as read)
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- ============================================================
-- 4. Welcome notification — fires when a new profile is created
-- ============================================================
CREATE OR REPLACE FUNCTION public.insert_welcome_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, detail, is_read)
  VALUES (
    NEW.id::text,
    'welcome',
    'DastarKhan Community mein Khush Amdeed! 🎉',
    'Pingu aapka intezaar kar raha tha! MediMenu, CuisineGPS, Taste of Pakistan aur Smart Kitchen explore karo.',
    false
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_welcome_notify ON public.profiles;
CREATE TRIGGER profile_welcome_notify
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.insert_welcome_notification();

-- ============================================================
-- 5. New dish broadcast — fires when a new food item is added
-- ============================================================
CREATE OR REPLACE FUNCTION public.insert_new_food_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  rest_name text;
BEGIN
  SELECT name INTO rest_name FROM public.restaurants WHERE id = NEW.restaurant_id;

  INSERT INTO public.notifications (user_id, type, title, detail, is_read)
  VALUES (
    'broadcast',
    'new_dish',
    'Naya Dish: ' || NEW.name,
    COALESCE(rest_name, 'DastarKhan') || ' ne menu mein naya dish add kiya — abhi try karo!',
    false
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS food_new_notify ON public.foods;
CREATE TRIGGER food_new_notify
  AFTER INSERT ON public.foods
  FOR EACH ROW EXECUTE FUNCTION public.insert_new_food_notification();

-- ============================================================
-- 6. New restaurant broadcast — fires when a new restaurant joins
-- ============================================================
CREATE OR REPLACE FUNCTION public.insert_new_restaurant_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, detail, is_read)
  VALUES (
    'broadcast',
    'new_restaurant',
    'Naya Restaurant: ' || NEW.name,
    COALESCE(NEW.area, 'Lahore') || ' mein naya restaurant DastarKhan family mein shamil ho gaya!',
    false
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restaurant_new_notify ON public.restaurants;
CREATE TRIGGER restaurant_new_notify
  AFTER INSERT ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.insert_new_restaurant_notification();

-- ============================================================
-- 7. Seed: insert a broadcast welcome if none exist yet
-- ============================================================
INSERT INTO public.notifications (user_id, type, title, detail, is_read)
SELECT
  'broadcast',
  'welcome',
  'DastarKhan Community mein Khush Amdeed! 🎉',
  'Pingu aapka intezaar kar raha tha! MediMenu, CuisineGPS, Taste of Pakistan aur Smart Kitchen explore karo.',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications WHERE user_id = 'broadcast' AND type = 'welcome'
);

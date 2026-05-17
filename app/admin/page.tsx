import { redirect } from "next/navigation"

/**
 * Old admin URL — permanently moved to /admin-order-check.
 * Anyone visiting /admin is sent straight to the new panel.
 */
export default function AdminRedirect() {
  redirect("/admin-order-check")
}

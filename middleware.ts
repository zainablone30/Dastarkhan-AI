import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
const IS_PROD = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"

export function middleware(request: NextRequest) {
  if (!SITE_URL || !IS_PROD) {
    return NextResponse.next()
  }

  const target = new URL(SITE_URL)
  const { nextUrl } = request

  if (nextUrl.hostname === "localhost" || nextUrl.hostname === "127.0.0.1") {
    return NextResponse.next()
  }

  if (nextUrl.hostname !== target.hostname) {
    const redirectUrl = nextUrl.clone()
    redirectUrl.protocol = target.protocol
    redirectUrl.hostname = target.hostname
    redirectUrl.port = target.port
    return NextResponse.redirect(redirectUrl, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/((?!_next|api|favicon.ico).*)",
}

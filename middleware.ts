import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - allow access without authentication
  const publicRoutes = ["/login", "/signup"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // Get authentication token from cookie
  const token = request.cookies.get("sb-access-token")?.value;

  if (!token) {
    // Not authenticated - redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Create Supabase client for edge runtime
  // Use service role key to query users table
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Middleware] Missing Supabase credentials");
    return NextResponse.next(); // Allow request if credentials missing (dev mode)
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Verify token and get user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    // Invalid token - redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear invalid cookie
    response.cookies.delete("sb-access-token");
    return response;
  }

  // Get user role from users table (service role can query directly)
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = userData?.role || user.user_metadata?.role || null;

  // Define route access rules
  const sharedRoutes = ["/patients", "/visits"];
  const nurseRoutes = ["/nurse-portal"];
  const doctorRoutes = [
    "/doctor",
    "/dashboard",
    "/calendar",
    "/inbox",
    "/medications",
  ];

  const isSharedRoute = sharedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isNurseRoute = nurseRoutes.some((route) => pathname.startsWith(route));
  const isDoctorRoute = doctorRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Handle shared routes - accessible by both roles
  if (isSharedRoute) {
    if (role === "doctor" || role === "nurse") {
      return NextResponse.next();
    }
    // If role doesn't match, redirect based on role
    if (role === "nurse") {
      return NextResponse.redirect(new URL("/nurse-portal", request.url));
    }
    if (role === "doctor") {
      return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
    }
    // Unknown role - redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Handle nurse routes - only nurses can access
  if (isNurseRoute) {
    if (role === "nurse") {
      return NextResponse.next();
    }
    if (role === "doctor") {
      // Doctor trying to access nurse route - redirect to doctor dashboard
      return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
    }
    // Not a nurse - redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Handle doctor routes - only doctors can access
  if (isDoctorRoute) {
    if (role === "doctor") {
      return NextResponse.next();
    }
    if (role === "nurse") {
      // Nurse trying to access doctor route - redirect to nurse portal
      return NextResponse.redirect(new URL("/nurse-portal", request.url));
    }
    // Not a doctor - redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Default behavior for other routes
  // If user has a role, redirect to appropriate dashboard
  if (role === "nurse") {
    return NextResponse.redirect(new URL("/nurse-portal", request.url));
  }
  if (role === "doctor") {
    return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
  }

  // Unknown role or no role - redirect to login
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

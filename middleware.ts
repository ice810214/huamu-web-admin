// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 所有需要登入的基本路由
const protectedPaths = [
  "/dashboard",
  "/dashboard/quote",
  "/dashboard/profile",
];

// 需要 admin 權限的路徑
const adminPaths = [
  "/dashboard/admin",
  "/dashboard/admin/users",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("firebase-auth")?.value;
  const role = request.cookies.get("user-role")?.value;

  // 登入檢查
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // admin 權限檢查
  if (adminPaths.some((path) => pathname.startsWith(path))) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

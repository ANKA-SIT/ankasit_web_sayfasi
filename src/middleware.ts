import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sunucu tarafı korumalı API rotaları için JWT doğrulaması
  if (pathname.startsWith("/api/admin")) {
    const secretRaw = process.env.JWT_SECRET;
    if (!secretRaw) {
      return NextResponse.json({ error: "Sunucu güvenlik anahtarı yapılandırılmamış." }, { status: 500 });
    }
    const token = req.cookies.get("anka_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }
    try {
      const secret = new TextEncoder().encode(secretRaw);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Geçersiz oturum." }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};

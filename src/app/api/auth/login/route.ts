import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "../../../../lib/supabase";
import { verifyPassword, createSessionToken } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const supabase = getServiceSupabase();

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Geçersiz kullanıcı adı veya şifre." }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Geçersiz kullanıcı adı veya şifre." }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
    });

    const response = NextResponse.json({
      success: true,
      role: user.role,
      fullName: user.full_name,
    });

    response.cookies.set("anka_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}

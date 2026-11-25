import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "../../../lib/supabase";
import { verifyServerSession } from "../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Honeypot spam koruması
    if (body.website_url_hp && body.website_url_hp.trim() !== "") {
      return NextResponse.json({ error: "Spam algılandı." }, { status: 400 });
    }

    const { full_name, email, department, grade, team_id, team_name, interest_area, motivation } = body;
    if (!full_name || !email || !department || !grade || !team_name || !motivation) {
      return NextResponse.json({ error: "Zorunlu alanlar eksik." }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("applications")
      .insert([{ full_name, email, department, grade, team_id, team_name, interest_area, motivation }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, application: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Başvuru kaydedilemedi." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await verifyServerSession(["ADMIN", "YK"]);
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  const { id, status, admin_note } = await req.json();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("applications")
    .update({ status, admin_note })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data });
}

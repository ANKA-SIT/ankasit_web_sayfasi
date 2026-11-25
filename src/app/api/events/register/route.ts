import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "../../../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { event_id, full_name, email, department, grade } = await req.json();
    if (!event_id || !full_name || !email || !department || !grade) {
      return NextResponse.json({ error: "Tüm alanları doldurunuz." }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc("register_for_event", {
      p_event_id: event_id,
      p_full_name: full_name,
      p_email: email,
      p_department: department,
      p_grade: grade,
    });

    if (error || !data?.success) {
      return NextResponse.json({ error: data?.error || error?.message || "Kayıt başarısız." }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

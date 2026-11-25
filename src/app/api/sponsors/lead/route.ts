import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "../../../../lib/supabase";
import { verifyServerSession } from "../../../../lib/auth";

// Sponsorluk olasılık hesaplama algoritması (Aşama + Sektör Uyumu + Bütçe Potansiyeli)
function computeSponsorProbability(stage: string, sectorFit = 75, budgetFit = 70): number {
  const stageWeights: Record<string, number> = {
    INITIAL_CONTACT: 25,
    MEETING_SCHEDULED: 45,
    PROPOSAL_SENT: 65,
    NEGOTIATION: 82,
    CLOSED_WON: 100,
    CLOSED_LOST: 0,
  };
  if (stage === "CLOSED_WON") return 100;
  if (stage === "CLOSED_LOST") return 0;
  const base = stageWeights[stage] ?? 30;
  return Math.min(98, Math.round(base * 0.55 + sectorFit * 0.25 + budgetFit * 0.20));
}

export async function POST(req: NextRequest) {
  try {
    const { company_name, contact_person, email, message } = await req.json();
    if (!company_name || !contact_person || !email || !message) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
    }

    const probability_percent = computeSponsorProbability("INITIAL_CONTACT", 75, 70);
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("sponsor_leads")
      .insert([{ company_name, contact_person, email, message, probability_percent }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, lead: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await verifyServerSession(["ADMIN", "YK"]);
  if (!session) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  const { id, stage, sectorFitScore, budgetPotentialScore, yk_notes } = await req.json();
  const probability_percent = computeSponsorProbability(stage, sectorFitScore, budgetPotentialScore);

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("sponsor_leads")
    .update({ stage, sectorFitScore, budgetPotentialScore, probability_percent, yk_notes })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data });
}

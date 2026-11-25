import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  const adminHash = await bcrypt.hash(process.env.INIT_ADMIN_PASS || "AnkaAdmin2026!", 12);
  const ykHash = await bcrypt.hash(process.env.INIT_YK_PASS || "AnkaYK2026!", 12);

  await supabase.from("admin_users").upsert([
    {
      username: process.env.INIT_ADMIN_USER || "admin",
      password_hash: adminHash,
      role: "ADMIN",
      full_name: "ANKA-SİT Sistem Yöneticisi",
    },
    {
      username: process.env.INIT_YK_USER || "yk_panel",
      password_hash: ykHash,
      role: "YK",
      full_name: "ANKA-SİT Yönetim Kurulu",
    },
  ], { onConflict: "username" });

  console.log("Admin ve YK kullanıcıları bcrypt hash ile oluşturuldu.");
}

seed();

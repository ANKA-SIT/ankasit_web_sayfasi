-- ============================================================================
-- DÜZCE ÜNİVERSİTESİ ANKA-SİT VERİTABANI ŞEMASI (PostgreSQL / Supabase)
-- İki dilli (TR/EN) içerik, Takım Dosyaları, Etkinlik Kontenjan Takibi,
-- Başvuru Yönetimi ve YK Sponsor Olasılık Karşılaştırma Modeli
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. YÖNETİCİ KULLANICILARI (Şifreler bcrypt ile hash'li saklanır, Rol: ADMIN | YK)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(16) NOT NULL CHECK (role IN ('ADMIN', 'YK')),
  full_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TAKIMLAR VE DOSYA (DOSSIER) BÖLÜMLERİ
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(32) NOT NULL,
  accent_color VARCHAR(16) DEFAULT '#E5E5E5',
  category_tr VARCHAR(120) NOT NULL,
  category_en VARCHAR(120) NOT NULL,
  tagline_tr TEXT NOT NULL,
  tagline_en TEXT NOT NULL,
  about_tr TEXT NOT NULL,
  about_en TEXT NOT NULL,
  mission_tr TEXT NOT NULL,
  mission_en TEXT NOT NULL,
  competition_areas_tr TEXT[] DEFAULT '{}',
  competition_areas_en TEXT[] DEFAULT '{}',
  sub_teams JSONB DEFAULT '[]'::jsonb,       -- [{name_tr, name_en, focus_tr, focus_en}]
  equipment_list JSONB DEFAULT '[]'::jsonb,  -- [{item, spec, category}]
  is_featured BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. YARIŞMA GEÇMİŞİ VE BAŞARILAR (Yıl Bazlı Timeline)
CREATE TABLE team_competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  year INT NOT NULL,
  title_tr VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  result_tr VARCHAR(200) NOT NULL,
  result_en VARCHAR(200) NOT NULL,
  description_tr TEXT,
  description_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TAKIM GALERİSİ VE İNDİRİLEBİLİR BELGELER (PDF Teknik Raporlar / Foto / Video)
CREATE TABLE team_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  asset_type VARCHAR(24) NOT NULL CHECK (asset_type IN ('PHOTO', 'VIDEO', 'PDF_REPORT')),
  title_tr VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  file_url TEXT NOT NULL,
  file_size VARCHAR(32),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TOPLULUK ÜYELERİ VE YÖNETİM KURULU
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(140) NOT NULL,
  role_tr VARCHAR(140) NOT NULL,
  role_en VARCHAR(140) NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  sub_unit VARCHAR(80),
  department_tr VARCHAR(140) NOT NULL,
  department_en VARCHAR(140) NOT NULL,
  grade VARCHAR(32) NOT NULL,
  bio_tr TEXT NOT NULL,
  bio_en TEXT NOT NULL,
  avatar_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  is_board_member BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ETKİNLİKLER (Kontenjan Takibi & Otomatik Kapanma)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(120) UNIQUE NOT NULL,
  title_tr VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  summary_tr TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  description_tr TEXT NOT NULL,
  description_en TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location_tr VARCHAR(200) NOT NULL,
  location_en VARCHAR(200) NOT NULL,
  category VARCHAR(64) NOT NULL,
  quota INT NOT NULL DEFAULT 50,
  registered_count INT NOT NULL DEFAULT 0,
  gallery_urls JSONB DEFAULT '[]'::jsonb,
  is_past BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ETKİNLİK KAYITLARI
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(160) NOT NULL,
  department VARCHAR(140) NOT NULL,
  grade VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- 8. ÜYELİK / TAKIM BAŞVURU FORMU KAYITLARI
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(160) NOT NULL,
  department VARCHAR(140) NOT NULL,
  grade VARCHAR(32) NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team_name VARCHAR(120) NOT NULL,
  interest_area VARCHAR(160) NOT NULL,
  motivation TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  admin_note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SPONSORLAR VE YK PANELİ SPONSOR ADAYLARI (Olasılık & Aşama Takibi)
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(160) NOT NULL,
  tier VARCHAR(32) DEFAULT 'PARTNER',
  logo_text VARCHAR(64) NOT NULL,
  website_url TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sponsor_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(160) NOT NULL,
  contact_person VARCHAR(140) NOT NULL,
  email VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  stage VARCHAR(32) NOT NULL DEFAULT 'INITIAL_CONTACT'
    CHECK (stage IN ('INITIAL_CONTACT', 'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')),
  sectorFitScore INT DEFAULT 75 CHECK (sectorFitScore BETWEEN 0 AND 100),
  budgetPotentialScore INT DEFAULT 70 CHECK (budgetPotentialScore BETWEEN 0 AND 100),
  probability_percent INT DEFAULT 45 CHECK (probability_percent BETWEEN 0 AND 100),
  yk_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Etkinlik kontenjan kontrolü için atomik RPC fonksiyonu
CREATE OR REPLACE FUNCTION register_for_event(
  p_event_id UUID,
  p_full_name VARCHAR,
  p_email VARCHAR,
  p_department VARCHAR,
  p_grade VARCHAR
) RETURNS JSONB AS $$
DECLARE
  v_quota INT;
  v_registered INT;
BEGIN
  SELECT quota, registered_count INTO v_quota, v_registered
  FROM events WHERE id = p_event_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'EVENT_NOT_FOUND');
  END IF;

  IF v_registered >= v_quota THEN
    RETURN jsonb_build_object('success', false, 'error', 'QUOTA_FULL');
  END IF;

  INSERT INTO event_registrations (event_id, full_name, email, department, grade)
  VALUES (p_event_id, p_full_name, p_email, p_department, p_grade);

  UPDATE events SET registered_count = registered_count + 1 WHERE id = p_event_id;

  RETURN jsonb_build_object('success', true, 'registered_count', v_registered + 1, 'quota', v_quota);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('success', false, 'error', 'ALREADY_REGISTERED');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

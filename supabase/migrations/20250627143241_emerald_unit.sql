/*
  # SABER-ICT Policy Framework Database Schema

  1. New Tables
    - `policy_themes` - Core policy themes (8 themes)
    - `policy_sub_themes` - Sub-themes within each policy theme
    - `cross_cutting_themes` - Cross-cutting themes (6 themes)
    - `policy_assessments` - Policy assessment records
    - `policy_theme_assessments` - Assessment scores for each theme
    - `policy_sub_theme_assessments` - Assessment scores for each sub-theme
    - `cross_cutting_theme_assessments` - Assessment scores for cross-cutting themes
    - `policy_recommendations` - Generated recommendations
    - `policy_evidence` - Supporting evidence for assessments

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their assessments
*/

-- Create enum types for policy framework
CREATE TYPE saber_stage AS ENUM ('Latent', 'Emerging', 'Established', 'Advanced');
CREATE TYPE assessment_level AS ENUM ('school', 'district', 'national');
CREATE TYPE assessment_status AS ENUM ('draft', 'completed', 'approved', 'archived');
CREATE TYPE recommendation_priority AS ENUM ('high', 'medium', 'low');

-- Policy themes table (8 core themes)
CREATE TABLE IF NOT EXISTS policy_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Policy sub-themes table
CREATE TABLE IF NOT EXISTS policy_sub_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES policy_themes(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL, -- e.g., "1.1", "2.3"
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(theme_id, code)
);

-- Cross-cutting themes table (6 themes)
CREATE TABLE IF NOT EXISTS cross_cutting_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Policy assessments table
CREATE TABLE IF NOT EXISTS policy_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  district VARCHAR(100),
  level assessment_level NOT NULL,
  assessment_date DATE NOT NULL,
  assessor_name VARCHAR(255) NOT NULL,
  assessor_role VARCHAR(100) NOT NULL,
  assessor_email VARCHAR(255) NOT NULL,
  overall_score DECIMAL(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  overall_stage saber_stage,
  status assessment_status DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Policy theme assessments (scores for each of the 8 themes)
CREATE TABLE IF NOT EXISTS policy_theme_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES policy_assessments(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES policy_themes(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  stage saber_stage NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assessment_id, theme_id)
);

-- Policy sub-theme assessments
CREATE TABLE IF NOT EXISTS policy_sub_theme_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_assessment_id UUID NOT NULL REFERENCES policy_theme_assessments(id) ON DELETE CASCADE,
  sub_theme_id UUID NOT NULL REFERENCES policy_sub_themes(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  stage saber_stage NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(theme_assessment_id, sub_theme_id)
);

-- Cross-cutting theme assessments
CREATE TABLE IF NOT EXISTS cross_cutting_theme_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES policy_assessments(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES cross_cutting_themes(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  stage saber_stage NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assessment_id, theme_id)
);

-- Policy recommendations
CREATE TABLE IF NOT EXISTS policy_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES policy_assessments(id) ON DELETE CASCADE,
  theme_code VARCHAR(50) NOT NULL,
  priority recommendation_priority NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  action_items TEXT[] NOT NULL,
  timeline VARCHAR(100),
  resources TEXT[],
  expected_impact TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Policy evidence (supporting documents and evidence)
CREATE TABLE IF NOT EXISTS policy_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES policy_assessments(id) ON DELETE CASCADE,
  theme_assessment_id UUID REFERENCES policy_theme_assessments(id) ON DELETE CASCADE,
  sub_theme_assessment_id UUID REFERENCES policy_sub_theme_assessments(id) ON DELETE CASCADE,
  cross_cutting_assessment_id UUID REFERENCES cross_cutting_theme_assessments(id) ON DELETE CASCADE,
  evidence_type VARCHAR(50) NOT NULL, -- 'document', 'url', 'note', 'data'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  file_path VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (
    (assessment_id IS NOT NULL AND theme_assessment_id IS NULL AND sub_theme_assessment_id IS NULL AND cross_cutting_assessment_id IS NULL) OR
    (assessment_id IS NULL AND theme_assessment_id IS NOT NULL AND sub_theme_assessment_id IS NULL AND cross_cutting_assessment_id IS NULL) OR
    (assessment_id IS NULL AND theme_assessment_id IS NULL AND sub_theme_assessment_id IS NOT NULL AND cross_cutting_assessment_id IS NULL) OR
    (assessment_id IS NULL AND theme_assessment_id IS NULL AND sub_theme_assessment_id IS NULL AND cross_cutting_assessment_id IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policy_assessments_school_id ON policy_assessments(school_id);
CREATE INDEX IF NOT EXISTS idx_policy_assessments_district ON policy_assessments(district);
CREATE INDEX IF NOT EXISTS idx_policy_assessments_date ON policy_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_policy_assessments_status ON policy_assessments(status);
CREATE INDEX IF NOT EXISTS idx_policy_theme_assessments_assessment_id ON policy_theme_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_policy_sub_theme_assessments_theme_assessment_id ON policy_sub_theme_assessments(theme_assessment_id);
CREATE INDEX IF NOT EXISTS idx_cross_cutting_theme_assessments_assessment_id ON cross_cutting_theme_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_policy_recommendations_assessment_id ON policy_recommendations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_policy_evidence_assessment_id ON policy_evidence(assessment_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_policy_themes_updated_at
    BEFORE UPDATE ON policy_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_sub_themes_updated_at
    BEFORE UPDATE ON policy_sub_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_cutting_themes_updated_at
    BEFORE UPDATE ON cross_cutting_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_assessments_updated_at
    BEFORE UPDATE ON policy_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_theme_assessments_updated_at
    BEFORE UPDATE ON policy_theme_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_sub_theme_assessments_updated_at
    BEFORE UPDATE ON policy_sub_theme_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_cutting_theme_assessments_updated_at
    BEFORE UPDATE ON cross_cutting_theme_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_recommendations_updated_at
    BEFORE UPDATE ON policy_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_evidence_updated_at
    BEFORE UPDATE ON policy_evidence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable row level security
ALTER TABLE policy_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_sub_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_cutting_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_theme_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_sub_theme_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_cutting_theme_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_evidence ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to framework data
CREATE POLICY "Policy themes are viewable by everyone"
    ON policy_themes
    FOR SELECT
    USING (true);

CREATE POLICY "Policy sub-themes are viewable by everyone"
    ON policy_sub_themes
    FOR SELECT
    USING (true);

CREATE POLICY "Cross-cutting themes are viewable by everyone"
    ON cross_cutting_themes
    FOR SELECT
    USING (true);

-- Create policies for policy assessments (authenticated users can view/edit)
CREATE POLICY "Policy assessments are viewable by everyone"
    ON policy_assessments
    FOR SELECT
    USING (true);

CREATE POLICY "Policy assessments are editable by authenticated users"
    ON policy_assessments
    FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Policy theme assessments are viewable by everyone"
    ON policy_theme_assessments
    FOR SELECT
    USING (true);

CREATE POLICY "Policy theme assessments are editable by authenticated users"
    ON policy_theme_assessments
    FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Policy sub-theme assessments are viewable by everyone"
    ON policy_sub_theme_assessments
    FOR SELECT
    USING (true);

CREATE POLICY "Policy sub-theme assessments are editable by authenticated users"
    ON policy_sub_theme_assessments
    FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Cross-cutting theme assessments are viewable by everyone"
    ON cross_cutting_theme_assessments
    FOR SELECT
    USING (true);

CREATE POLICY "Cross-cutting theme assessments are editable by authenticated users"
    ON cross_cutting_theme_assessments
    FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Policy recommendations are viewable by everyone"
    ON policy_recommendations
    FOR SELECT
    USING (true);

CREATE POLICY "Policy recommendations are editable by authenticated users"
    ON policy_recommendations
    FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Policy evidence is viewable by everyone"
    ON policy_evidence
    FOR SELECT
    USING (true);

CREATE POLICY "Policy evidence is editable by authenticated users"
    ON policy_evidence
    FOR ALL
    TO authenticated
    USING (true);

-- Insert the 8 core policy themes
INSERT INTO policy_themes (code, name, description, order_index) VALUES
('vision_planning', 'Vision and Planning', 'Strategic vision, sectoral linkages, funding, institutions, and public-private partnerships', 1),
('ict_infrastructure', 'ICT Infrastructure', 'Electricity, equipment, networking, and technical support systems', 2),
('teachers', 'Teachers', 'Teacher training, competency standards, support networks, and leadership', 3),
('skills_competencies', 'Skills and Competencies', 'Digital literacy and 21st-century skills development', 4),
('learning_resources', 'Learning Resources', 'Digital content, educational resources, and learning materials', 5),
('emis', 'EMIS (Education Management Information Systems)', 'ICT use in education management and administration', 6),
('monitoring_evaluation', 'Monitoring & Evaluation', 'Impact measurement, assessment systems, and research & development', 7),
('equity_inclusion_safety', 'Equity, Inclusion, Safety', 'Addressing disparities, digital safety, and inclusive access', 8)
ON CONFLICT (code) DO NOTHING;

-- Insert cross-cutting themes
INSERT INTO cross_cutting_themes (code, name, description, order_index) VALUES
('distance_education', 'Distance Education', 'Remote and blended learning capabilities', 1),
('mobiles', 'Mobile Learning', 'Strategic use of mobile devices in education', 2),
('early_childhood', 'Early Childhood Development', 'ICT integration in early childhood education', 3),
('open_educational_resources', 'Open Educational Resources', 'OER policies and repositories', 4),
('community_involvement', 'Community Involvement', 'Stakeholder engagement in ICT education', 5),
('data_privacy', 'Data Privacy', 'Student data protection and privacy policies', 6)
ON CONFLICT (code) DO NOTHING;

-- Insert sub-themes for Vision and Planning
DO $$
DECLARE
    theme_id UUID;
BEGIN
    SELECT id INTO theme_id FROM policy_themes WHERE code = 'vision_planning';
    
    INSERT INTO policy_sub_themes (theme_id, code, name, description, order_index) VALUES
    (theme_id, '1.1', 'Vision/Goals', 'Clear vision and goals for ICT in education', 1),
    (theme_id, '1.2', 'Sectoral Linkages', 'Alignment with other education and development policies', 2),
    (theme_id, '1.3', 'Funding', 'Sustainable financing for ICT in education', 3),
    (theme_id, '1.4', 'Institutions', 'Institutional arrangements for ICT in education', 4),
    (theme_id, '1.5', 'Public-Private Partnerships', 'Engagement with private sector for ICT in education', 5)
    ON CONFLICT (theme_id, code) DO NOTHING;
END $$;

-- Insert sub-themes for ICT Infrastructure
DO $$
DECLARE
    theme_id UUID;
BEGIN
    SELECT id INTO theme_id FROM policy_themes WHERE code = 'ict_infrastructure';
    
    INSERT INTO policy_sub_themes (theme_id, code, name, description, order_index) VALUES
    (theme_id, '2.1', 'Electricity', 'Reliable electricity access for schools', 1),
    (theme_id, '2.2', 'Equipment/Networking', 'ICT devices and network infrastructure', 2),
    (theme_id, '2.3', 'Support/Maintenance', 'Technical support and maintenance systems', 3)
    ON CONFLICT (theme_id, code) DO NOTHING;
END $$;

-- Insert sub-themes for Teachers
DO $$
DECLARE
    theme_id UUID;
BEGIN
    SELECT id INTO theme_id FROM policy_themes WHERE code = 'teachers';
    
    INSERT INTO policy_sub_themes (theme_id, code, name, description, order_index) VALUES
    (theme_id, '3.1', 'Training', 'ICT training for teachers', 1),
    (theme_id, '3.2', 'Competency Standards', 'ICT competency standards for teachers', 2),
    (theme_id, '3.3', 'Networks/Resource Centers', 'Teacher support networks and resource centers', 3),
    (theme_id, '3.4', 'Leadership Training', 'ICT leadership training for school administrators', 4)
    ON CONFLICT (theme_id, code) DO NOTHING;
END $$;

-- Insert sub-themes for Skills and Competencies
DO $$
DECLARE
    theme_id UUID;
BEGIN
    SELECT id INTO theme_id FROM policy_themes WHERE code = 'skills_competencies';
    
    INSERT INTO policy_sub_themes (theme_id, code, name, description, order_index) VALUES
    (theme_id, '4.1', 'Digital Literacy', 'Digital literacy curriculum and standards', 1),
    (theme_id, '4.2', 'Lifelong Learning', 'ICT-enabled lifelong learning opportunities', 2)
    ON CONFLICT (theme_id, code) DO NOTHING;
END $$;

-- Insert sub-themes for Learning Resources
DO $$
DECLARE
    theme_id UUID;
BEGIN
    SELECT id INTO theme_id FROM policy_themes WHERE code = 'learning_resources';
    
    INSERT INTO policy_sub_themes (theme_id, code, name, description, order_index) VALUES
    (theme_id, '5.1', 'Digital Content', 'Digital learning content and resources', 1)
    ON CONFLICT (theme_id, code) DO NOTHING;
END $$;

-- Insert sub-themes for EMIS
DO $$
DECLARE
    theme_id UUID;
BEGIN
    SELECT id INTO theme_id FROM policy_themes WHERE code = 'emis';
    
    INSERT INTO policy_sub_themes (theme_id, code, name, description, order_index) VALUES
    (theme_id, '6.1', 'ICT in Management', 'ICT systems for education management', 1)
    ON CONFLICT (theme_id, code) DO NOTHING;
END $$;

-- Insert sub-themes for Monitoring & Evaluation
DO $$
DECLARE
    theme_id UUID;
BEGIN
    SELECT id INTO theme_id FROM policy_themes WHERE code = 'monitoring_evaluation';
    
    INSERT INTO policy_sub_themes (theme_id, code, name, description, order_index) VALUES
    (theme_id, '7.1', 'Impact Measurement', 'Monitoring and evaluation of ICT in education impact', 1),
    (theme_id, '7.2', 'ICT in Assessments', 'Use of ICT in student assessments', 2),
    (theme_id, '7.3', 'R&D/Innovation', 'Research and development in ICT for education', 3)
    ON CONFLICT (theme_id, code) DO NOTHING;
END $$;

-- Insert sub-themes for Equity, Inclusion, Safety
DO $$
DECLARE
    theme_id UUID;
BEGIN
    SELECT id INTO theme_id FROM policy_themes WHERE code = 'equity_inclusion_safety';
    
    INSERT INTO policy_sub_themes (theme_id, code, name, description, order_index) VALUES
    (theme_id, '8.1', 'Pro-Equity', 'Addressing digital divides and ensuring equitable access', 1),
    (theme_id, '8.2', 'Digital Safety', 'Digital citizenship, online safety, and ethics', 2)
    ON CONFLICT (theme_id, code) DO NOTHING;
END $$;
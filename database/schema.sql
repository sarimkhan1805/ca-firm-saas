-- ============================================
-- CA Firm SaaS - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- USERS PROFILE TABLE
-- Extends Supabase auth.users with role and firm info
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('firm_admin', 'team_member', 'client')),
    firm_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- FIRMS TABLE
-- Represents an onshore CA firm (UK/US)
CREATE TABLE firms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- JOBS TABLE
-- Core table for accounting tasks/jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'in_progress', 'review', 'completed')),
    firm_id UUID REFERENCES firms(id),
    client_id UUID REFERENCES profiles(id),     -- the client this job belongs to
    assigned_to UUID REFERENCES profiles(id),   -- offshore team member
    created_by UUID REFERENCES profiles(id),    -- firm admin who created it
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- DOCUMENTS TABLE
-- Tracks files uploaded to Supabase Storage against jobs
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,            -- path inside Supabase Storage bucket
    uploaded_by UUID REFERENCES profiles(id),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (Basic - tighten in production)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write (simple policy for MVP)
CREATE POLICY "Authenticated users can view profiles"
    ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can manage jobs"
    ON jobs FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage documents"
    ON documents FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view firms"
    ON firms FOR SELECT TO authenticated USING (true);

-- ============================================
-- STORAGE BUCKET
-- Create a bucket named "job-documents" in Supabase Storage UI
-- Then run the policy below
-- ============================================
-- CREATE POLICY "Authenticated users can upload"
--     ON storage.objects FOR INSERT TO authenticated
--     WITH CHECK (bucket_id = 'job-documents');
-- 
-- CREATE POLICY "Authenticated users can view"
--     ON storage.objects FOR SELECT TO authenticated
--     USING (bucket_id = 'job-documents');

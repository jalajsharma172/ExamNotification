-- Enable the uuid-ossp extension to generate UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the exams table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  status TEXT DEFAULT 'Unknown',
  expected_date TEXT,
  details TEXT,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_retrying BOOLEAN DEFAULT FALSE
);

-- Create the history table
CREATE TABLE check_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  status TEXT,
  expected_date TEXT,
  details TEXT,
  is_correct BOOLEAN DEFAULT TRUE,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_history ENABLE ROW LEVEL SECURITY;

-- Create policies to allow access (since this is a personal app, we allow full access)
CREATE POLICY "Allow public full access on exams" ON exams FOR ALL USING (true);
CREATE POLICY "Allow public full access on check_history" ON check_history FOR ALL USING (true);

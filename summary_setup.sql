-- Create the exam_summaries table
CREATE TABLE exam_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE UNIQUE,
  concise_text TEXT NOT NULL,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE exam_summaries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow full access (since this is a personal app)
CREATE POLICY "Allow public full access on exam_summaries" ON exam_summaries FOR ALL USING (true);

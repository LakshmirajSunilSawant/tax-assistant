-- Users table (managed by Clerk, reference only)
-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT DEFAULT 'New Conversation',
    itr_form TEXT,
    total_deductions NUMERIC(12, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed'))
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'itr_result', 'deduction', 'error')),
    metadata JSONB
);

-- Tax profiles table
CREATE TABLE IF NOT EXISTS tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    income_sources TEXT[] DEFAULT '{}',
    total_income NUMERIC(15, 2),
    itr_form TEXT,
    deductions JSONB DEFAULT '{}',
    documents_uploaded TEXT[] DEFAULT '{}',
    validation_errors JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tax_profiles_user_id ON tax_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_profiles_conversation_id ON tax_profiles(conversation_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_profiles_updated_at
    BEFORE UPDATE ON tax_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

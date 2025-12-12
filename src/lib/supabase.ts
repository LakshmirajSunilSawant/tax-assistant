import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Conversation {
    id: string
    user_id: string
    created_at: string
    updated_at: string
    title: string
    itr_form?: string
    total_deductions?: number
    status: 'active' | 'completed'
}

export interface Message {
    id: string
    conversation_id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
    message_type?: 'text' | 'itr_result' | 'deduction' | 'error'
    metadata?: any
}

export interface TaxProfile {
    id: string
    user_id: string
    conversation_id: string
    income_sources: string[]
    total_income?: number
    itr_form?: string
    deductions: any
    documents_uploaded: string[]
    validation_errors: any[]
    created_at: string
    updated_at: string
}

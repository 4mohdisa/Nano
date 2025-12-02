import { createClient } from '@supabase/supabase-js'

// Supabase configuration with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.warn('⚠️ Supabase URL not configured. Database features will be disabled.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  console.warn('⚠️ Supabase Anon Key not configured. Database features will be disabled.')
}

// Create Supabase client (only if properly configured)
export const supabase = supabaseUrl && supabaseAnonKey &&
                        supabaseUrl !== 'https://your-project-id.supabase.co' &&
                        supabaseAnonKey !== 'your-anon-key-here'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any

// Database types
export interface Database {
  public: {
    Tables: {
      edit_history: {
        Row: {
          id: string
          post_id: string
          post_title: string
          request_text: string
          analysis: string
          edit_prompt: string
          original_image_url: string
          edited_image_url: string | null
          post_url: string | null
          method: string
          status: 'completed' | 'failed'
          processing_time: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          post_title: string
          request_text: string
          analysis: string
          edit_prompt: string
          original_image_url: string
          edited_image_url?: string | null
          post_url?: string | null
          method: string
          status?: 'completed' | 'failed'
          processing_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          post_title?: string
          request_text?: string
          analysis?: string
          edit_prompt?: string
          original_image_url?: string
          edited_image_url?: string | null
          post_url?: string | null
          method?: string
          status?: 'completed' | 'failed'
          processing_time?: number | null
          updated_at?: string
        }
      }
    }
  }
}

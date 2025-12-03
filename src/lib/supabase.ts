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
      analytics: {
        Row: {
          id: string
          event_type: 'page_view' | 'edit_request' | 'edit_complete' | 'edit_failed'
          session_id: string
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: 'page_view' | 'edit_request' | 'edit_complete' | 'edit_failed'
          session_id: string
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
      }
      edit_history: {
        Row: {
          id: string
          original_image_url: string
          edited_image_url: string | null
          prompt: string
          analysis: string | null
          source_type: 'upload' | 'reddit'
          source_title: string | null
          source_url: string | null
          model: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          processing_time_ms: number | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          original_image_url: string
          edited_image_url?: string | null
          prompt: string
          analysis?: string | null
          source_type?: 'upload' | 'reddit'
          source_title?: string | null
          source_url?: string | null
          model?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          processing_time_ms?: number | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          original_image_url?: string
          edited_image_url?: string | null
          prompt?: string
          analysis?: string | null
          source_type?: 'upload' | 'reddit'
          source_title?: string | null
          source_url?: string | null
          model?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          processing_time_ms?: number | null
          error_message?: string | null
          updated_at?: string
        }
      }
    }
  }
}

import { supabase, Database } from './supabase'

// Database service layer with localStorage fallback

export class DatabaseService {
  private static isSupabaseConfigured(): boolean {
    return !!(supabase &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here')
  }

  // Edit History
  static async saveEditHistory(edit: Omit<Database['public']['Tables']['edit_history']['Insert'], 'user_id'>) {
    console.log('DatabaseService.saveEditHistory called:', { hasSupabase: this.isSupabaseConfigured() })

    if (this.isSupabaseConfigured()) {
      try {
        console.log('Attempting to save to Supabase:', edit)

        const { data, error } = await supabase
          .from('edit_history')
          .insert(edit)
          .select()
          .single()

        if (error) {
          console.error('Supabase insert error:', error)
          throw error
        }

        console.log('Successfully saved to Supabase:', data)
        return data
      } catch (error: any) {
        console.warn('Supabase save failed, falling back to localStorage:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      }
    }

    // Fallback: Store in localStorage
    const history = this.getLocalEditHistory()
    const newEdit = { ...edit, id: edit.id || `history_${Date.now()}` }
    history.unshift(newEdit)

    // Keep only last 50 items to prevent storage issues
    const limitedHistory = history.slice(0, 50)
    localStorage.setItem('editHistory', JSON.stringify(limitedHistory))
    return newEdit
  }

  static async getEditHistory(limit = 50) {
    if (this.isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('edit_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        return data || []
      } catch (error) {
        console.warn('Supabase fetch failed, falling back to localStorage:', error)
      }
    }

    // Fallback: Get from localStorage
    return this.getLocalEditHistory()
  }

  private static getLocalEditHistory() {
    try {
      const history = localStorage.getItem('editHistory')
      return history ? JSON.parse(history) : []
    } catch {
      return []
    }
  }

  // Clear all edit history data
  static async clearAllData() {
    if (this.isSupabaseConfigured()) {
      try {
        await supabase.from('edit_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      } catch (error) {
        console.warn('Supabase clear failed:', error)
      }
    }
    localStorage.removeItem('editHistory')
    localStorage.removeItem('pendingEditorItem')
  }
}

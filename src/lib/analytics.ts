import { supabase, Database } from './supabase'

type EventType = Database['public']['Tables']['analytics']['Row']['event_type']

// Generate a simple session ID (persisted in localStorage)
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let sessionId = localStorage.getItem('nano_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('nano_session_id', sessionId)
  }
  return sessionId
}

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(supabase &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here')
}

// Track an analytics event
export async function trackEvent(
  eventType: EventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[Analytics] Supabase not configured, skipping event:', eventType)
    return
  }

  try {
    const { error } = await supabase
      .from('analytics')
      .insert({
        event_type: eventType,
        session_id: getSessionId(),
        metadata: metadata || null
      })

    if (error) {
      console.warn('[Analytics] Failed to track event:', error.message)
    }
  } catch (err) {
    console.warn('[Analytics] Error tracking event:', err)
  }
}

// Get analytics summary (for admin dashboard if needed)
export async function getAnalyticsSummary(): Promise<{
  totalSessions: number
  totalEdits: number
  successRate: number
} | null> {
  if (!isSupabaseConfigured()) return null

  try {
    // Get unique sessions
    const { data: sessions } = await supabase
      .from('analytics')
      .select('session_id')
    
    const uniqueSessions = new Set(sessions?.map((s: { session_id: string }) => s.session_id) || [])

    // Get edit counts
    const { count: editRequests } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'edit_request')

    const { count: editComplete } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'edit_complete')

    const totalEdits = editRequests || 0
    const successfulEdits = editComplete || 0
    const successRate = totalEdits > 0 ? (successfulEdits / totalEdits) * 100 : 0

    return {
      totalSessions: uniqueSessions.size,
      totalEdits,
      successRate: Math.round(successRate * 10) / 10
    }
  } catch (err) {
    console.warn('[Analytics] Error getting summary:', err)
    return null
  }
}

/**
 * Rate Limiting, Circuit Breaker, and Load Shedding System
 * Protects API routes from abuse and excessive usage
 */

interface RateLimitEntry {
  count: number
  firstRequest: number
  lastRequest: number
  blocked: boolean
  blockExpires: number
}

interface CircuitBreakerState {
  failures: number
  lastFailure: number
  state: 'closed' | 'open' | 'half-open'
  openedAt: number
}

interface LoadSheddingState {
  requestsInWindow: number
  windowStart: number
  shedding: boolean
}

// In-memory stores (reset on server restart - for production use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()
const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  state: 'closed',
  openedAt: 0
}
const loadShedding: LoadSheddingState = {
  requestsInWindow: 0,
  windowStart: Date.now(),
  shedding: false
}

// Configuration
const CONFIG = {
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute window
  MAX_REQUESTS_PER_WINDOW: 10, // Max 10 requests per minute per IP
  BLOCK_DURATION_MS: 5 * 60 * 1000, // Block for 5 minutes after exceeding limit
  
  // Brute Force Protection
  SUSPICIOUS_THRESHOLD: 5, // Requests in quick succession
  SUSPICIOUS_WINDOW_MS: 10 * 1000, // 10 seconds
  BRUTE_FORCE_BLOCK_MS: 15 * 60 * 1000, // Block for 15 minutes
  
  // Circuit Breaker
  FAILURE_THRESHOLD: 5, // Open circuit after 5 failures
  CIRCUIT_RESET_MS: 30 * 1000, // Try to close after 30 seconds
  HALF_OPEN_MAX_REQUESTS: 2, // Allow 2 test requests in half-open state
  
  // Load Shedding
  LOAD_WINDOW_MS: 60 * 1000, // 1 minute window
  MAX_GLOBAL_REQUESTS: 100, // Max 100 requests globally per minute
  SHED_PERCENTAGE: 50, // Reject 50% of requests when shedding
}

/**
 * Get client identifier from request
 */
function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')
  
  return cfIp || realIp || forwarded?.split(',')[0]?.trim() || 'unknown'
}

/**
 * Check if request should be rate limited
 */
function checkRateLimit(clientId: string): { allowed: boolean; reason?: string; retryAfter?: number } {
  const now = Date.now()
  let entry = rateLimitStore.get(clientId)
  
  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    const cutoff = now - CONFIG.BLOCK_DURATION_MS
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.lastRequest < cutoff && !value.blocked) {
        rateLimitStore.delete(key)
      }
    }
  }
  
  // Check if currently blocked
  if (entry?.blocked) {
    if (now < entry.blockExpires) {
      return {
        allowed: false,
        reason: 'Too many requests. You have been temporarily blocked.',
        retryAfter: Math.ceil((entry.blockExpires - now) / 1000)
      }
    }
    // Block expired, reset entry
    entry = undefined
    rateLimitStore.delete(clientId)
  }
  
  if (!entry) {
    // First request from this client
    rateLimitStore.set(clientId, {
      count: 1,
      firstRequest: now,
      lastRequest: now,
      blocked: false,
      blockExpires: 0
    })
    return { allowed: true }
  }
  
  // Check if window has expired
  if (now - entry.firstRequest > CONFIG.RATE_LIMIT_WINDOW_MS) {
    // Reset window
    entry.count = 1
    entry.firstRequest = now
    entry.lastRequest = now
    return { allowed: true }
  }
  
  // Brute force detection - rapid requests
  const timeSinceLastRequest = now - entry.lastRequest
  if (timeSinceLastRequest < CONFIG.SUSPICIOUS_WINDOW_MS / CONFIG.SUSPICIOUS_THRESHOLD) {
    // Requests coming too fast
    entry.count += 2 // Penalize rapid requests
  }
  
  entry.count++
  entry.lastRequest = now
  
  // Check if limit exceeded
  if (entry.count > CONFIG.MAX_REQUESTS_PER_WINDOW) {
    entry.blocked = true
    entry.blockExpires = now + CONFIG.BLOCK_DURATION_MS
    
    // Extended block for suspected brute force
    if (entry.count > CONFIG.MAX_REQUESTS_PER_WINDOW * 2) {
      entry.blockExpires = now + CONFIG.BRUTE_FORCE_BLOCK_MS
    }
    
    return {
      allowed: false,
      reason: 'Rate limit exceeded. Please slow down.',
      retryAfter: Math.ceil(CONFIG.BLOCK_DURATION_MS / 1000)
    }
  }
  
  return { allowed: true }
}

/**
 * Circuit Breaker - protects against cascading failures
 */
function checkCircuitBreaker(): { allowed: boolean; reason?: string } {
  const now = Date.now()
  
  switch (circuitBreaker.state) {
    case 'open':
      // Check if we should try half-open
      if (now - circuitBreaker.openedAt > CONFIG.CIRCUIT_RESET_MS) {
        circuitBreaker.state = 'half-open'
        circuitBreaker.failures = 0
        return { allowed: true }
      }
      return {
        allowed: false,
        reason: 'Service temporarily unavailable. Please try again later.'
      }
      
    case 'half-open':
      // Allow limited requests to test
      if (circuitBreaker.failures < CONFIG.HALF_OPEN_MAX_REQUESTS) {
        return { allowed: true }
      }
      return {
        allowed: false,
        reason: 'Service recovering. Please try again shortly.'
      }
      
    case 'closed':
    default:
      return { allowed: true }
  }
}

/**
 * Record a failure for circuit breaker
 */
function recordFailure(): void {
  const now = Date.now()
  circuitBreaker.failures++
  circuitBreaker.lastFailure = now
  
  if (circuitBreaker.state === 'half-open') {
    // Failed during recovery, reopen circuit
    circuitBreaker.state = 'open'
    circuitBreaker.openedAt = now
  } else if (circuitBreaker.failures >= CONFIG.FAILURE_THRESHOLD) {
    // Too many failures, open circuit
    circuitBreaker.state = 'open'
    circuitBreaker.openedAt = now
  }
}

/**
 * Record a success for circuit breaker
 */
function recordSuccess(): void {
  if (circuitBreaker.state === 'half-open') {
    // Successful request during recovery, close circuit
    circuitBreaker.state = 'closed'
    circuitBreaker.failures = 0
  } else if (circuitBreaker.state === 'closed') {
    // Decay failures over time
    circuitBreaker.failures = Math.max(0, circuitBreaker.failures - 1)
  }
}

/**
 * Load Shedding - reject requests when under heavy load
 */
function checkLoadShedding(): { allowed: boolean; reason?: string } {
  const now = Date.now()
  
  // Reset window if expired
  if (now - loadShedding.windowStart > CONFIG.LOAD_WINDOW_MS) {
    loadShedding.requestsInWindow = 0
    loadShedding.windowStart = now
    loadShedding.shedding = false
  }
  
  loadShedding.requestsInWindow++
  
  // Check if we need to start shedding
  if (loadShedding.requestsInWindow > CONFIG.MAX_GLOBAL_REQUESTS) {
    loadShedding.shedding = true
  }
  
  // If shedding, randomly reject requests
  if (loadShedding.shedding) {
    if (Math.random() * 100 < CONFIG.SHED_PERCENTAGE) {
      return {
        allowed: false,
        reason: 'Server is experiencing high load. Please try again in a moment.'
      }
    }
  }
  
  return { allowed: true }
}

/**
 * Main protection check - combines all protection mechanisms
 */
export function checkProtection(request: Request): {
  allowed: boolean
  reason?: string
  retryAfter?: number
  clientId: string
} {
  const clientId = getClientId(request)
  
  // 1. Check rate limit first (per-client)
  const rateLimitResult = checkRateLimit(clientId)
  if (!rateLimitResult.allowed) {
    return { ...rateLimitResult, clientId }
  }
  
  // 2. Check circuit breaker (system-wide)
  const circuitResult = checkCircuitBreaker()
  if (!circuitResult.allowed) {
    return { ...circuitResult, clientId }
  }
  
  // 3. Check load shedding (system-wide)
  const loadResult = checkLoadShedding()
  if (!loadResult.allowed) {
    return { ...loadResult, clientId }
  }
  
  return { allowed: true, clientId }
}

/**
 * Record API call result for circuit breaker
 */
export function recordApiResult(success: boolean): void {
  if (success) {
    recordSuccess()
  } else {
    recordFailure()
  }
}

/**
 * Get current protection status (for monitoring)
 */
export function getProtectionStatus(): {
  circuitState: string
  circuitFailures: number
  loadSheddingActive: boolean
  requestsInWindow: number
  activeClients: number
} {
  return {
    circuitState: circuitBreaker.state,
    circuitFailures: circuitBreaker.failures,
    loadSheddingActive: loadShedding.shedding,
    requestsInWindow: loadShedding.requestsInWindow,
    activeClients: rateLimitStore.size
  }
}

/**
 * Create error response for blocked requests
 */
export function createBlockedResponse(
  reason: string,
  retryAfter?: number
): Response {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString()
  }
  
  return new Response(
    JSON.stringify({
      ok: false,
      error: reason,
      retryAfter: retryAfter || null,
      timestamp: new Date().toISOString()
    }),
    {
      status: 429,
      headers
    }
  )
}

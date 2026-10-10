/**
 * In-process concurrency locks for Nitro server routes.
 * Serializes concurrent operations per userId or transaction key to prevent race conditions (double-spending and duplicate webhook processing).
 */

const userLockMap = new Map<string, Promise<unknown>>()
const activeWebhookKeys = new Set<string>()

/**
 * Executes an async task with mutual exclusion for a specific user ID.
 * Subsequent concurrent calls for the same userId will wait for the active one to complete.
 */
export async function withUserLock<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  const currentLock = userLockMap.get(userId) || Promise.resolve()
  let release: () => void = () => {}
  const nextLock = new Promise<void>((resolve) => {
    release = resolve
  })

  userLockMap.set(userId, currentLock.then(() => nextLock))

  try {
    await currentLock
    return await fn()
  } finally {
    release()
    if (userLockMap.get(userId) === nextLock) {
      userLockMap.delete(userId)
    }
  }
}

/**
 * Checks and acquires a temporary webhook lock for a specific key (e.g. orderId / paymentId).
 * Returns true if the lock was acquired, false if it is currently being processed.
 */
export function acquireWebhookLock(lockKey: string): boolean {
  if (activeWebhookKeys.has(lockKey)) {
    return false
  }
  activeWebhookKeys.add(lockKey)
  return true
}

/**
 * Releases a webhook lock. Retains the key in activeWebhookKeys for a safety cooldown period (30s)
 * to guard against near-simultaneous duplicate network deliveries.
 */
export function releaseWebhookLock(lockKey: string, cooldownMs = 30000): void {
  setTimeout(() => {
    activeWebhookKeys.delete(lockKey)
  }, cooldownMs)
}

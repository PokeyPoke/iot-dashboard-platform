import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
    })
  }
  return redis
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  const data = await redis.get(key)
  if (data) {
    return JSON.parse(data)
  }
  return null
}

export async function setCachedData<T>(key: string, data: T, ttl: number): Promise<void> {
  const redis = getRedis()
  await redis.setex(key, ttl, JSON.stringify(data))
}

export async function deleteCachedData(key: string): Promise<void> {
  const redis = getRedis()
  await redis.del(key)
}

export async function invalidateCache(pattern: string): Promise<void> {
  const redis = getRedis()
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}
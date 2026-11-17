import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    retryStrategy(times) {
      return Math.min(times * 100, 3000);
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export default redis;


import redis from 'ioredis';

export const redisClient = new redis({ port: Number(process.env.REDIS_PORT) || 6379 })


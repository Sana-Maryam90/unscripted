// Redis client configuration
import { createClient } from 'redis';

let redis = null;

export async function getRedisClient() {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redis = createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('Connected to Redis');
    });

    redis.on('reconnecting', () => {
      console.log('Reconnecting to Redis...');
    });

    await redis.connect();
  }

  return redis;
}

export async function closeRedisConnection() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

// Redis key helpers
export const REDIS_KEYS = {
  room: (roomId) => `room:${roomId}`,
  roomCode: (code) => `code:${code}`,
  player: (playerId) => `player:${playerId}`,
  activeGame: (roomId) => `game:${roomId}`,
  roomList: () => 'rooms:active',
};

// Redis utility functions
export async function setWithExpiry(key, value, expirySeconds = 3600) {
  const client = await getRedisClient();
  return await client.setEx(key, expirySeconds, JSON.stringify(value));
}

export async function get(key) {
  const client = await getRedisClient();
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
}

export async function del(key) {
  const client = await getRedisClient();
  return await client.del(key);
}

export async function exists(key) {
  const client = await getRedisClient();
  return await client.exists(key);
}
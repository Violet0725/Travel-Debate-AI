import Redis from 'ioredis';

// Validate environment variable
if (!process.env.REDIS_URL) {
  console.warn('Warning: REDIS_URL is not set in environment variables');
}

// Create a Redis client with error handling
function createRedisClient() {
  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
  });

  client.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  return client;
}

// Helper to safely execute Redis operations
export async function withRedis(operation) {
  const redis = createRedisClient();
  
  try {
    await redis.connect();
    const result = await operation(redis);
    return result;
  } catch (error) {
    console.error('Redis operation failed:', error.message);
    throw error;
  } finally {
    try {
      await redis.quit();
    } catch (quitError) {
      console.error('Redis quit error:', quitError.message);
      redis.disconnect();
    }
  }
}

// Export for cases where manual control is needed
export { createRedisClient };
export default createRedisClient;

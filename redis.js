const { Redis } = require("ioredis");

// BullMQ requires separate connection instances for Queue and Worker
// so we export a factory rather than a singleton
function createRedisConnection() {
  return new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null, // required by BullMQ
  });
}

module.exports = { createRedisConnection };

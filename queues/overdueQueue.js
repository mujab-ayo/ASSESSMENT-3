const { Queue } = require("bullmq");
const { createRedisConnection } = require("../redis");

const QUEUE_NAME = "overdue-tasks";

const overdueQueue = new Queue(QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: 10, // keep last 10 completed jobs for inspection
    removeOnFail: 50,     // keep last 50 failed jobs for debugging
  },
});

module.exports = { overdueQueue, QUEUE_NAME };

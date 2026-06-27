const { Worker } = require("bullmq");
const { createRedisConnection } = require("../redis");
const { QUEUE_NAME } = require("../queues/overdueQueue");
const taskSchema = require("../models/task");
const userSchema = require("../models/user");
const { notifyUser } = require("../websocket");
const { sendOverdueEmail } = require("../mailer");

/**
 * Core processor: find all tasks past their due date that are not yet
 * overdue/completed, mark them overdue, and notify their owners.
 */
async function processOverdueCheck(job) {
  const now = new Date();
  console.log(`[Worker] Running overdue check — job #${job.id} at ${now.toISOString()}`);

  const overdueTasks = await taskSchema.find({
    due_date: { $lt: now },
    status: { $in: ["pending", "in progress"] },
  });

  if (overdueTasks.length === 0) {
    console.log("[Worker] No newly overdue tasks found.");
    return { processed: 0 };
  }

  let processed = 0;

  for (const task of overdueTasks) {
    task.status = "overdue";
    task.lastUpdateAt = now;
    await task.save();

    const owner = await userSchema.findById(task.user);
    if (!owner) continue;

    // Real-time WebSocket notification (no-op if user is offline)
    notifyUser(String(task.user), {
      type: "task_overdue",
      taskId: task._id,
      title: task.title,
      message: `Your task "${task.title}" is now overdue.`,
    });

    // Email notification (no-op if email not configured)
    await sendOverdueEmail(owner, task);

    console.log(
      `[Worker] Task "${task.title}" (${task._id}) marked overdue for user ${owner.username}`
    );
    processed++;
  }

  return { processed };
}

function createOverdueWorker() {
  const worker = new Worker(QUEUE_NAME, processOverdueCheck, {
    connection: createRedisConnection(),
    concurrency: 1, // overdue checks should run serially to avoid duplicate writes
  });

  worker.on("completed", (job, result) => {
    console.log(`[Worker] Job #${job.id} completed — ${result.processed} task(s) marked overdue`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job #${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("[Worker] Worker error:", err.message);
  });

  return worker;
}

module.exports = { createOverdueWorker };

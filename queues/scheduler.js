const { overdueQueue } = require("./overdueQueue");
const { createOverdueWorker } = require("../workers/overdueWorker");

const JOB_NAME = "check-overdue-tasks";

// Every 60 seconds (adjust via OVERDUE_CHECK_INTERVAL_MS in .env)
const INTERVAL_MS = parseInt(process.env.OVERDUE_CHECK_INTERVAL_MS || "60000");

/**
 * Register a single repeatable job on the queue and start the worker.
 * BullMQ's repeatable jobs survive process restarts — the schedule is
 * persisted in Redis, so re-registering on startup is idempotent.
 */
async function startOverdueScheduler() {
  // Remove stale repeatable jobs with a different interval before adding ours
  const repeatableJobs = await overdueQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    if (job.name === JOB_NAME && job.every !== INTERVAL_MS) {
      await overdueQueue.removeRepeatableByKey(job.key);
      console.log(`[Scheduler] Removed stale repeatable job: ${job.key}`);
    }
  }

  await overdueQueue.add(
    JOB_NAME,
    {}, // no payload needed — worker queries the DB itself
    {
      repeat: { every: INTERVAL_MS },
      jobId: JOB_NAME, // stable ID prevents duplicate registrations
    }
  );

  console.log(`[Scheduler] Overdue check scheduled every ${INTERVAL_MS / 1000}s`);

  // Boot the worker in the same process
  createOverdueWorker();
}

module.exports = { startOverdueScheduler };

const todoRoute = require("express").Router();
const taskSchema = require("../models/task");
const userSchema = require("../models/user");
const { notifyUser } = require("../websocket");
const { sendCompletedEmail } = require("../mailer");

todoRoute.get("/", async (req, res, next) => {
  try {
    const tasks = await taskSchema
      .find({ user: req.user.id })
      .sort({ due_date: 1 });
    // The JWT lives in the cookie — read it directly, no session lookup needed
    const wsToken = req.cookies?.token || "";
    res.render("task", { tasks, wsToken });
  } catch (error) {
    return next(error);
  }
});

todoRoute.post("/", async (req, res, next) => {
  try {
    const { title, description, due_date } = req.body;
    const user = req.user.id;

    await taskSchema.create({ title, description, due_date, user });
    res.redirect("/task");
  } catch (error) {
    return next(error);
  }
});

todoRoute.post("/:taskId/update", async (req, res, next) => {
  try {
    const { status } = req.body;

    const task = await taskSchema.findOneAndUpdate(
      { _id: req.params.taskId, user: req.user.id },
      { status, lastUpdateAt: new Date() },
      { new: true },
    );

    if (!task) {
      const error = new Error("Task not found");
      return next(error);
    }

    // Notify on completion
    if (status === "completed") {
      const owner = await userSchema.findById(req.user.id);

      notifyUser(String(req.user.id), {
        type: "task_completed",
        taskId: task._id,
        title: task.title,
        message: `Your task "${task.title}" has been marked as completed!`,
      });

      await sendCompletedEmail(owner, task);
    }

    res.redirect("/task");
  } catch (error) {
    return next(error);
  }
});

todoRoute.post("/:taskId/delete", async (req, res, next) => {
  try {
    const task = await taskSchema.findOneAndDelete({
      _id: req.params.taskId,
      user: req.user.id,
    });

    if (!task) {
      const error = new Error("Task not found");
      return next(error);
    }

    res.redirect("/task");
  } catch (error) {
    return next(error);
  }
});

module.exports = todoRoute;

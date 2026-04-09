const todoRoute = require("express").Router();
const taskSchema = require("../models/task");
const user = require("../models/user");

todoRoute.get("/", async (req, res, next) => {
  try {
    const tasks = await taskSchema.find({ user: req.user.id });
    res.render("task", { tasks });
  } catch (error) {
    return next(error);
  }
});

todoRoute.post("/", async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const user = req.user.id;

    await taskSchema.create({ title, description, user });
    res.redirect("/task");
  } catch (error) {
    return next(error);
  }
});

todoRoute.post("/:taskId/update", async (req, res, next) => {
  try {
    const task = await taskSchema.findOneAndUpdate(
      { _id: req.params.taskId, user: req.user.id },
      { status: req.body.status },
      { new: true },
    );

    if (!task) {
      const error = new Error("Task not found");
      return next(error);
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

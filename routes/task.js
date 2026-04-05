const express = require("express");
const Task = require("../models/task");

const taskRoute = express.Router();

taskRoute.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.render("task", { tasks });
  } catch (error) {
    return next(error);
  }
});

taskRoute.post("/", async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const user = req.user.id;

    const task = await Task.create({ title, description, user });
    res.redirect("/task");
      
  } catch (error) {
    return next(error);
  }
});


taskRoute.patch("/:taskId", async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
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

taskRoute.delete("/:taskId", async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
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



module.exports = taskRoute;

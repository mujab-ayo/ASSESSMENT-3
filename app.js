require("dotenv").config();

const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const authRoute = require("./routes/auth");
const todoRoute = require("./routes/todo");
const { requireAuth } = require("./middleware/auth");
const { createWebSocketServer } = require("./websocket");
const { startOverdueScheduler } = require("./queues/scheduler");
const DB = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/", authRoute);

// requireAuth replaces connectEnsureLogin + passport.session
app.use("/task", requireAuth, todoRoute);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500);
  res.json({ err: err.message });
});

// Create HTTP server to share port between Express and WebSocket
const server = http.createServer(app);

createWebSocketServer(server);

DB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startOverdueScheduler();
  });
});

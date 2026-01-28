const express = require("express");
const path = require("path");

const gameRoutes = require("./routes/gameRoutes");

const app = express();

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Routes
app.use("/game", gameRoutes);

app.get("/", (req, res) => {
  res.render("Home");
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

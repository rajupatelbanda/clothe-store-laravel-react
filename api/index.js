// api/index.js
const app = require("../node_backend/index");

// Add a simple health check directly here
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Gemini API is live",
    time: new Date().toISOString()
  });
});

module.exports = app;

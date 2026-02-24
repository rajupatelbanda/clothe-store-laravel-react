try {
  const app = require("../node_backend/index");

  // Add a direct health check route to the exported app
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      node_env: process.env.NODE_ENV,
      mongodb_ready: !!process.env.MONGODB_URI
    });
  });

  module.exports = app;
} catch (error) {
  console.error("FATAL ERROR IN API ENTRY:", error);
  
  // Export a simple express app that shows the error if the main one fails
  const express = require('express');
  const errorApp = express();
  errorApp.all('*', (req, res) => {
    res.status(500).json({
      error: "Express Application failed to initialize",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
  module.exports = errorApp;
}

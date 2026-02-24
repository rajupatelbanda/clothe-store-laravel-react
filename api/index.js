// api/index.js - Improved Diagnostic Version
try {
  console.log("Initializing API...");
  console.log("Current working directory:", process.cwd());
  
  // Check if the backend entry file exists
  const path = require('path');
  const fs = require('fs');
  const backendPath = path.join(process.cwd(), 'node_backend', 'index.js');
  
  if (!fs.existsSync(backendPath)) {
    console.error("CRITICAL ERROR: node_backend/index.js not found at", backendPath);
    throw new Error(`Backend entry file missing at ${backendPath}`);
  }

  const app = require("../node_backend/index");

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "Backend is operational",
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      db_configured: !!process.env.MONGODB_URI
    });
  });

  module.exports = app;
} catch (error) {
  console.error("FATAL INITIALIZATION ERROR:", error);
  
  const express = require('express');
  const errorApp = express();
  errorApp.all('*', (req, res) => {
    res.status(500).json({
      error: "Server Initialization Failed",
      details: error.message,
      hint: "Check Vercel logs for the full stack trace",
      path_attempted: process.cwd()
    });
  });
  module.exports = errorApp;
}

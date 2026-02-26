/**
 * src/routes/health.routes.js
 */

const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    data: {
      status: 'ok',
      time: new Date().toISOString()
    }
  });
});

module.exports = { healthRouter: router };

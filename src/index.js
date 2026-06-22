const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const notificationRoutes = require('./routes/notifications');
const templateRoutes = require('./routes/templates');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/notifications', notificationRoutes);
app.use('/api/templates', templateRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notifications', uptime: process.uptime() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
  });
}

module.exports = app;

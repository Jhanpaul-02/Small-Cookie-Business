import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Khaleb’s Cookies API is running.' });
});

app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});
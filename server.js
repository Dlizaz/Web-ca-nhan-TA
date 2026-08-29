const express = require('express');
const path = require('path');

const app = express();

// Railway cấp PORT qua biến môi trường, phải dùng process.env.PORT
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

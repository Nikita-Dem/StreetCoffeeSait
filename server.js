const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/streetcoffee', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Схема заказа
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  items: [{
    id: Number,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  customerInfo: {
    name: String,
    phone: String,
    email: String,
    address: String
  },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Генерация уникального ID заказа
function generateOrderId() {
  return 'SC' + Date.now() + Math.floor(Math.random() * 1000);
}

// API для сохранения заказа
app.post('/api/orders', async (req, res) => {
  try {
    const { items, total, customerInfo } = req.body;
    
    const order = new Order({
      orderId: generateOrderId(),
      items,
      total,
      customerInfo,
      status: 'pending'
    });
    
    await order.save();
    
    res.status(201).json({
      success: true,
      message: 'Заказ успешно сохранен',
      orderId: order.orderId
    });
  } catch (error) {
    console.error('Ошибка при сохранении заказа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при сохранении заказа'
    });
  }
});

// API для получения истории заказов
app.get('/api/orders/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const orders = await Order.find({ 'customerInfo.phone': phone })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Ошибка при получении истории заказов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении истории заказов'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
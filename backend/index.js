// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes Import
import bookRoutes from './routes/bookRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/payment.js';
import authRoutes from './routes/authRoutes.js';       // 🔹 Authentication + Check Admin APIs
import uploadRoutes from './routes/uploadRoutes.js';   // 🔹 File Upload APIs

// ✅ Use Routes
app.use('/api/books', bookRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);          // 🆕 Authentication + Check-Admin Routes
app.use('/api/upload', uploadRoutes);      // 🆕 File Upload Routes

// ✅ Root Endpoint
app.get('/', (req, res) => {
  res.send('📚 StudyYatra Backend is running 🚀');
});

// ✅ Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running at http://0.0.0.0:${PORT}`);
});

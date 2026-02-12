import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import circleRoutes from './routes/circles.js';
import eventRoutes from './routes/events.js';
import messageRoutes from './routes/messages.js';
import careplanRoutes from './routes/careplan.js';
import taskRoutes from './routes/tasks.js';
import providerRoutes from './routes/providers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/careplan', careplanRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/providers', providerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

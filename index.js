import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import { errorHandler, notFound } from './middleWare/errorMiddleware.js'

dotenv.config()

connectDB() // Connect to MongoDB

const dev = process.env.NODE_ENV !== 'production';
const server = dev ? 'http://localhost:3000' : process.env.WEBSITE_URL;

const app = express()
app.use(cors({
   origin: server,
   credentials: true
}));

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cookie Parser middleware
app.use(cookieParser())

app.get('/', (req, res) => {
   res.send('API is running...')
})

app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)

app.get('/api/config/paypal', (req, res) => res.send({ clientId: process.env.PAYPAL_CLIENT_ID }))

// const __dirname = path.resolve()
// app.use('uploads', express.static(path.join(__dirname, 'uploads')))

if (process.env.NODE_ENV === 'production') {
   const __dirname = path.resolve();
   app.use('/uploads', express.static('/var/data/uploads'));
   app.use(express.static(path.join(__dirname, '/frontend/build')));

   app.get('*', (req, res) =>
      res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
   );
} else {
   const __dirname = path.resolve();
   app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
   app.get('/', (req, res) => {
      res.send('API is running....');
   });
}

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () =>
   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
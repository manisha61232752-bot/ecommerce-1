import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n[WARNING] MongoDB Connection Error: ${error.message}`);
    console.warn(`[DEMO MODE] Mongoose database connection failed. Backend is running in local in-memory mock fallback mode!\n`);
  }
};

export default connectDB;

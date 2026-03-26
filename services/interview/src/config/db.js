import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socraticmind_interviews');
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[MongoDB] Error: ${err.message}`);
    process.exit(1);
  }
}

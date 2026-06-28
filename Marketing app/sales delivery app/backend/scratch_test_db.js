import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://jannatulakiba70023_db_user:3CwhzXgKDVsiRktM@cluster0.aquyopo.mongodb.net/";
const dbName = 'clothDelivery';

const testConnection = async () => {
  try {
    console.log("Connecting with URI:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      dbName: dbName,
      family: 4 // Force IPv4
    });
    console.log("✅ Successfully connected to MongoDB!");
    await mongoose.disconnect();
    console.log("Disconnected.");
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error(error);
  }
};

testConnection();

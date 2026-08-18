import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.info("[finora] MONGODB_URI is not set; using the seeded in-memory demo store.");
    return "memory";
  }

  await mongoose.connect(uri);
  console.info("[finora] MongoDB connected.");
  return "mongodb";
}

export function isMongoReady() {
  return mongoose.connection.readyState === 1;
}


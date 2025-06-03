// This file ensures MongoDB is disconnected after all tests
import mongoose from 'mongoose';

afterAll(async () => {
  await mongoose.connection.close();
});

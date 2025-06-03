// src/__tests__/setup.ts
jest.setTimeout(30000); // Increase timeout for all tests/hooks

process.env.DATABASE_URL = 'mongodb://localhost:27017/car-dealer-test';
process.env.JWT_SECRET = 'testsecretkey123';

import mongoose from 'mongoose';

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  // if you start a server in tests, close it here
  // if (server) await server.close();
});

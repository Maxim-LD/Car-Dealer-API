// src/__tests__/setup.ts
process.env.DATABASE_URL = 'mongodb://localhost:27017/car-dealer-test';
process.env.JWT_SECRET = 'testsecretkey123';

import mongoose from 'mongoose';

// Optionally, if you start your app server in tests, import it here
// import app from '../app';
// let server;
// beforeAll(async () => {
//   server = app.listen(0);
// });

afterAll(async () => {
  await mongoose.connection.close();
  // if you start a server in tests, close it here
  // if (server) await server.close();
});

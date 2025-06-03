# Car Dealer API

A RESTful API for managing a car dealership platform, built with Node.js, Express, TypeScript, and MongoDB. It supports user authentication, car inventory management, purchase transactions, payment integration (Paystack), and role-based access for admins, managers, and customers.

## Features
- User authentication (signup, login, password reset)
- Role-based access: Admin, Manager, Customer
- Car inventory management (CRUD)
- Category management
- Car purchase and transaction tracking
- Paystack payment integration
- Email notifications (via SMTP)
- Rate limiting and request sanitization
- Comprehensive testing with Jest and Supertest

## Project Structure
```
src/
  app.ts            # Express app setup
  index.ts          # App entry point
  config/           # Database and config files
  controllers/      # Route controllers (admin, auth, car, customer, manager)
  interfaces/       # TypeScript interfaces and enums
  middlewares/      # Express middlewares (auth, error handling, etc.)
  models/           # Mongoose models (Car, User, Transaction, etc.)
  routes/           # Express routers
  services/         # Business logic and integrations (Payment, User, Car, etc.)
  types/            # Custom type definitions
  utils/            # Utility functions
  validations/      # Joi validation schemas
  __tests__/        # Jest/Supertest test suites
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or remote)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd "Car Dealer API"
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env` and add values as needed

### Running the App
- **Development mode (with hot reload):**
  ```bash
  npm run dev
  ```
- **Production build:**
  ```bash
  npm run build
  npm start
  ```

### Linting & Formatting
- **Lint:**
  ```bash
  npm run lint
  ```
- **Lint & fix:**
  ```bash
  npm run lint:fix
  ```

### Testing
- **Run all tests:**
  ```bash
  npm run test
  ```

## License
ISC

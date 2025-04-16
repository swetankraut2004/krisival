# Krishival – Agriculture E-Commerce Platform

A full-stack web application connecting farmers directly with customers, facilitating the sale of agricultural products within a local radius.

## Features

### For Farmers
- Register and manage profile
- Upload farm products (crops, vegetables, tools, fertilizers)
- Set prices and manage inventory
- Track orders and deliveries
- View customer reviews and ratings

### For Customers
- Browse nearby farm products (50-100 km radius)
- Filter products by category and price
- View detailed product information
- Contact farmers directly
- Track order status
- Rate and review products

### For Admin
- Approve/reject farmer registrations
- Manage product listings
- Handle user management
- Process complaints
- View sales analytics
- Manage system notifications

## Tech Stack
- Frontend: React.js with Bootstrap
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT
- Location Services: Geolocation API

## Project Structure
```
krishival/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── middleware/         # Custom middleware
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Create a .env file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd client
   npm start
   ```

## API Documentation
The API documentation will be available at `/api-docs` once the server is running.

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details. 
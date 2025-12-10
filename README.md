# Style Decor Server

Express.js server for the Style Decor application with MongoDB integration.

## Features

- Express.js REST API
- MongoDB with Mongoose ODM
- CORS enabled
- Environment variable configuration
- Health check endpoint

## Folder Structure

```
server/
├── config/           # Configuration files (database, etc.)
├── controllers/      # Route controllers
├── middlewares/      # Custom middleware
├── models/           # Mongoose models
├── routes/           # API routes
├── utils/            # Utility functions
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── package.json      # Dependencies
└── server.js         # Main entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string and other variables as needed

3. Start the server:

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Check server status

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/styleDecor |

## License

ISC

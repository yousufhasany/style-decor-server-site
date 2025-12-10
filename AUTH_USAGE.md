# Authentication API Usage Examples

## Base URL
```
http://localhost:5001/api
```

## 1. Register New User
**POST** `/auth/register`

### Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "6938f40aa88114ea5851f13e",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2025-12-10T04:16:10.037Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 2. Login User
**POST** `/auth/login`

### Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "6938f40aa88114ea5851f13e",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2025-12-10T04:16:10.037Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 3. Create Booking (Protected Route)
**POST** `/bookings`

### Headers:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Request Body:
```json
{
  "userInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "serviceId": "507f1f77bcf86cd799439011",
  "date": "2025-12-15T10:00:00Z",
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "paymentStatus": "pending"
}
```

### Response (201):
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "userInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "serviceId": "507f1f77bcf86cd799439011",
    "date": "2025-12-15T10:00:00.000Z",
    "location": {
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "paymentStatus": "pending",
    "bookingStatus": "pending",
    "_id": "6938f35b2f03e5ae36cfeef5",
    "createdAt": "2025-12-10T04:13:15.048Z",
    "updatedAt": "2025-12-10T04:13:15.048Z"
  }
}
```

## Error Responses

### 401 Unauthorized (No Token):
```json
{
  "success": false,
  "message": "Not authorized. Please login to access this resource."
}
```

### 401 Unauthorized (Invalid Token):
```json
{
  "success": false,
  "message": "Invalid token. Please login again."
}
```

### 401 Unauthorized (Expired Token):
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

## Using the JWT Token

After login or registration, save the token and include it in the Authorization header for all protected routes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Token Configuration

JWT tokens expire after 7 days by default. This can be configured in the `.env` file:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## Protected Routes

The following routes require authentication:
- `POST /api/bookings` - Create a new booking

## Middleware Usage

To protect additional routes, import and use the `protect` middleware:

```javascript
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// Protect a route (any authenticated user)
router.post('/endpoint', protect, controllerFunction);

// Restrict to specific roles
router.delete('/endpoint', protect, restrictTo('admin'), controllerFunction);
```

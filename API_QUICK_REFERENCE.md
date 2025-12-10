# 🚀 Quick Reference: Role-Based API

## Authentication Header
```
Authorization: Bearer <firebase_token_or_jwt_token>
```

## 🎭 Roles
- **user** - Regular customers
- **decorator** - Service providers (needs approval)
- **admin** - Full system access

---

## 📋 API Endpoints by Role

### 🔓 Public Routes (No auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/health` | Health check |

### 👤 User Routes (Any authenticated user)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create new booking |

### 🎨 Decorator Routes (Role: decorator, approved)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/decorator/profile` | Update own profile |

### 👑 Admin Routes (Role: admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| PATCH | `/api/users/:userId/role` | Change user role |
| GET | `/api/decorators` | Get all decorators |
| POST | `/api/decorators/make` | Make user a decorator |
| PATCH | `/api/decorators/:decoratorId/approval` | Approve/disable decorator |

---

## 🔐 Authentication Methods

### Method 1: JWT (Email/Password)
```bash
# Step 1: Register or Login
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

# Step 2: Use token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Method 2: Firebase
```javascript
// Client-side
const token = await auth.currentUser.getIdToken();

// Use in API calls
fetch('/api/bookings', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 💡 Common Tasks

### Make User an Admin
```bash
PATCH /api/users/:userId/role
Authorization: Bearer <admin_token>
{
  "role": "admin"
}
```

### Make User a Decorator
```bash
POST /api/decorators/make
Authorization: Bearer <admin_token>
{
  "userId": "user_id_here",
  "specialties": ["Wedding", "Home Decoration"]
}
```

### Approve Decorator
```bash
PATCH /api/decorators/:decoratorId/approval
Authorization: Bearer <admin_token>
{
  "isApproved": true
}
```

### Update Decorator Profile
```bash
PATCH /api/decorator/profile
Authorization: Bearer <decorator_token>
{
  "specialties": ["Wedding", "Corporate Events"],
  "phoneNumber": "+1234567890",
  "photoURL": "https://example.com/photo.jpg"
}
```

### Create Booking
```bash
POST /api/bookings
Authorization: Bearer <user_token>
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

---

## ⚡ PowerShell Quick Test

```powershell
# 1. Register
$body = @{name="Test User"; email="test@example.com"; password="test123"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.token

# 2. Use token
$headers = @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:5001/api/bookings" -Headers $headers
```

---

## 🔄 Role Promotion Flow

```
New User (role: user)
    ↓
Admin makes decorator → POST /api/decorators/make
    ↓
Decorator (isApproved: false)
    ↓
Admin approves → PATCH /api/decorators/:id/approval
    ↓
Decorator (isApproved: true) ✅
```

---

## 🛡️ Middleware Usage in Code

```javascript
const { hybridAuth, restrictTo, requireApprovedDecorator } = require('./middlewares/hybridAuth.middleware');

// Any authenticated user
router.post('/bookings', hybridAuth, createBooking);

// Specific role(s)
router.get('/admin/users', hybridAuth, restrictTo('admin'), getUsers);

// Multiple roles
router.get('/dashboard', hybridAuth, restrictTo('admin', 'decorator'), getDashboard);

// Approved decorators only
router.patch('/project/status', hybridAuth, requireApprovedDecorator, updateStatus);
```

---

## 📊 Response Formats

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error (401 Unauthorized)
```json
{
  "success": false,
  "message": "Not authorized. Please login to access this resource."
}
```

### Error (403 Forbidden)
```json
{
  "success": false,
  "message": "Access denied. This resource requires one of the following roles: admin"
}
```

---

## 🔥 Firebase Config (Client)

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCzV5pdIz1PtVllie5PyWbgXMJQI17JX94",
  authDomain: "smart-home-and-ceremony-dec.firebaseapp.com",
  projectId: "smart-home-and-ceremony-dec",
  storageBucket: "smart-home-and-ceremony-dec.firebasestorage.app",
  messagingSenderId: "373966472518",
  appId: "1:373966472518:web:2b4aa33497c327827b1147"
};
```

---

**Base URL:** `http://localhost:5001/api`  
**Authentication:** Required for all routes except public routes  
**Token Type:** JWT or Firebase ID Token

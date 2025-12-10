# Hybrid Authentication System - Setup Complete ✅

## What Was Implemented

### 🔐 Hybrid Authentication System
Your server now supports **both Firebase Authentication and JWT tokens** for maximum flexibility:

1. **Firebase Authentication** - For modern web/mobile apps with social login
2. **JWT Authentication** - Traditional email/password authentication

### 👥 Role-Based Access Control
Three user roles implemented:
- **user** - Regular customers (default role)
- **decorator** - Service providers (requires admin approval)
- **admin** - System administrators

### 📁 Files Created/Modified

#### New Files:
1. `config/firebase.js` - Firebase Admin SDK initialization
2. `middlewares/hybridAuth.middleware.js` - Hybrid authentication middleware
3. `controllers/user.controller.js` - User and decorator management
4. `routes/user.routes.js` - Role-based API routes
5. `HYBRID_AUTH_GUIDE.md` - Complete documentation
6. `SETUP_SUMMARY.md` - This file

#### Modified Files:
1. `models/user.model.js` - Added decorator fields and Firebase UID
2. `routes/booking.routes.js` - Updated to use hybrid auth
3. `server.js` - Added Firebase initialization and user routes
4. `.env` - Added Firebase configuration

### 🚀 New API Endpoints

#### Admin Endpoints (Role: admin)
```
GET    /api/users                              - Get all users
PATCH  /api/users/:userId/role                 - Update user role
GET    /api/decorators                         - Get all decorators
POST   /api/decorators/make                    - Make user a decorator
PATCH  /api/decorators/:decoratorId/approval   - Approve/disable decorator
```

#### Decorator Endpoints (Role: decorator)
```
PATCH  /api/decorator/profile                  - Update decorator profile
```

#### User Endpoints (Authenticated users)
```
POST   /api/bookings                           - Create booking (already protected)
```

### 🔧 Setup Instructions

#### Step 1: Add Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `smart-home-and-ceremony-dec`
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Copy the entire JSON content and add to `.env`:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"smart-home-and-ceremony-dec",...}
```

#### Step 2: Restart Server
```bash
npm start
# or
npm run dev
```

#### Step 3: Test the System

**Option A: Test with JWT (Email/Password)**
```bash
# 1. Register a user
POST http://localhost:5001/api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

# 2. Use the returned token in Authorization header
Authorization: Bearer <jwt_token>
```

**Option B: Test with Firebase Token**
```javascript
// In your React/Next.js app
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const token = await result.user.getIdToken();

// Use token in API requests
fetch('http://localhost:5001/api/bookings', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 📊 User Model Structure

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed, optional if using Firebase),
  firebaseUid: String (unique, for Firebase users),
  role: 'user' | 'admin' | 'decorator',
  photoURL: String,
  phoneNumber: String,
  isActive: Boolean,
  
  // Decorator-specific fields
  specialties: [String],
  rating: Number (0-5),
  totalProjects: Number,
  isApproved: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

### 🎯 Role Management Flow

#### Making a User a Decorator:
1. Admin logs in
2. Admin calls `POST /api/decorators/make` with userId
3. User role changes to "decorator"
4. `isApproved` is set to `false`
5. Admin approves with `PATCH /api/decorators/:decoratorId/approval`
6. Decorator can now access decorator routes

#### Direct Role Assignment:
```
PATCH /api/users/:userId/role
{
  "role": "admin"  // or "decorator" or "user"
}
```

### 🔒 Security Features

✅ Password hashing with bcrypt
✅ JWT token expiration (7 days default)
✅ Firebase token verification
✅ Role-based access control
✅ Decorator approval system
✅ Account activation/deactivation
✅ Environment variable protection

### 📱 Client-Side Integration

#### React/Next.js Firebase Setup:
```javascript
// firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzV5pdIz1PtVllie5PyWbgXMJQI17JX94",
  authDomain: "smart-home-and-ceremony-dec.firebaseapp.com",
  projectId: "smart-home-and-ceremony-dec",
  storageBucket: "smart-home-and-ceremony-dec.firebasestorage.app",
  messagingSenderId: "373966472518",
  appId: "1:373966472518:web:2b4aa33497c327827b1147"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

#### API Helper Function:
```javascript
// api/client.js
export const apiClient = async (endpoint, options = {}) => {
  const token = await auth.currentUser?.getIdToken();
  
  return fetch(`http://localhost:5001/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers
    }
  });
};
```

### 🧪 Testing Endpoints

#### PowerShell Commands:

**1. Create Admin User:**
```powershell
$body = @{
  name = "Admin User"
  email = "admin@styledecor.com"
  password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**2. Login and Get Token:**
```powershell
$body = @{
  email = "admin@styledecor.com"
  password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.token
```

**3. Make User a Decorator:**
```powershell
$headers = @{ Authorization = "Bearer $token" }
$body = @{
  userId = "user_id_here"
  specialties = @("Wedding", "Home Decoration")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/decorators/make" -Method Post -Body $body -ContentType "application/json" -Headers $headers
```

### 📖 Additional Documentation

- `HYBRID_AUTH_GUIDE.md` - Detailed authentication guide
- `AUTH_USAGE.md` - JWT authentication examples

### ⚠️ Important Notes

1. **Firebase Service Account**: Without the service account key, Firebase authentication will not work. JWT authentication will still function.

2. **Admin Account**: Create the first admin manually in the database or promote a user via database update:
   ```javascript
   db.users.updateOne(
     { email: "admin@styledecor.com" },
     { $set: { role: "admin" } }
   )
   ```

3. **Decorator Approval**: Decorators must be approved by admin before accessing decorator-only routes.

4. **Token Storage**: Store tokens securely in httpOnly cookies or secure localStorage on the client.

### 🎉 Next Steps

1. Add Firebase service account key to `.env`
2. Restart the server
3. Create admin user
4. Test role-based endpoints
5. Integrate with your React/Next.js frontend
6. Implement additional features from requirements:
   - Service CRUD operations
   - Booking management
   - Payment integration with Stripe
   - Analytics dashboard

### 📞 Support

For questions or issues, refer to:
- `HYBRID_AUTH_GUIDE.md`
- Firebase Documentation: https://firebase.google.com/docs
- JWT Documentation: https://jwt.io/

---

**System Status: ✅ Ready for Development**

The hybrid authentication system is fully implemented and ready to use. Both Firebase and JWT authentication methods are supported, with comprehensive role-based access control for users, decorators, and admins.

# Hybrid Authentication System (Firebase + JWT)

## Overview
This system supports **both Firebase Authentication and JWT tokens** to accommodate different client types and role-based access control.

## Authentication Methods

### 1. Firebase Authentication (Recommended for Web/Mobile)
- Users authenticate via Firebase on the client
- Client sends Firebase ID token to server
- Server verifies token and creates/retrieves user from database
- Supports social login (Google, Facebook, etc.)

### 2. JWT Authentication (Traditional)
- Users register/login with email/password
- Server generates JWT token
- Client stores and sends JWT token

## User Roles
- **user** - Regular customers (default)
- **decorator** - Service providers (requires admin approval)
- **admin** - System administrators

## API Endpoints

### Authentication Routes

#### Register with Email/Password (JWT)
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login with Email/Password (JWT)
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Admin Routes (Requires admin role)

#### Get All Users
```
GET /api/users
Headers: Authorization: Bearer <token>
```

#### Update User Role
```
PATCH /api/users/:userId/role
Headers: Authorization: Bearer <token>
Body:
{
  "role": "decorator" | "admin" | "user"
}
```

#### Get All Decorators
```
GET /api/decorators
Headers: Authorization: Bearer <token>
```

#### Make User a Decorator
```
POST /api/decorators/make
Headers: Authorization: Bearer <token>
Body:
{
  "userId": "user_id_here",
  "specialties": ["Wedding", "Home Decoration"]
}
```

#### Approve/Disable Decorator
```
PATCH /api/decorators/:decoratorId/approval
Headers: Authorization: Bearer <token>
Body:
{
  "isApproved": true | false
}
```

### Decorator Routes (Requires decorator role)

#### Update Decorator Profile
```
PATCH /api/decorator/profile
Headers: Authorization: Bearer <token>
Body:
{
  "specialties": ["Wedding", "Corporate Events"],
  "phoneNumber": "+1234567890",
  "photoURL": "https://example.com/photo.jpg"
}
```

### Protected Routes (Any authenticated user)

#### Create Booking
```
POST /api/bookings
Headers: Authorization: Bearer <token>
Body:
{
  "userInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "serviceId": "service_id_here",
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

## Firebase Setup

### Step 1: Get Service Account Key
1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Click "Generate New Private Key"
4. Download JSON file

### Step 2: Add to Environment Variables
Add the entire JSON content as a single line to your `.env`:
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"..."}
```

### Step 3: Client-Side Firebase (React/Next.js)
```javascript
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzV5pdIz1PtVllie5PyWbgXMJQI17JX94",
  authDomain: "smart-home-and-ceremony-dec.firebaseapp.com",
  projectId: "smart-home-and-ceremony-dec",
  storageBucket: "smart-home-and-ceremony-dec.firebasestorage.app",
  messagingSenderId: "373966472518",
  appId: "1:373966472518:web:2b4aa33497c327827b1147"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Sign-In
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const token = await user.getIdToken();
  
  // Send token to your backend
  fetch('http://localhost:5001/api/bookings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ /* booking data */ })
  });
};
```

## How It Works

### Token Verification Flow
1. Client sends request with `Authorization: Bearer <token>`
2. Server extracts token from header
3. Server tries Firebase token verification first
4. If Firebase fails, tries JWT verification
5. If authentication succeeds, attaches `req.user` and `req.authType`
6. Route handlers can access authenticated user via `req.user`

### Role-Based Access
```javascript
// Protect route for authenticated users
router.post('/bookings', hybridAuth, createBooking);

// Restrict to specific roles
router.get('/admin/users', hybridAuth, restrictTo('admin'), getAllUsers);

// Multiple roles allowed
router.get('/dashboard', hybridAuth, restrictTo('admin', 'decorator'), getDashboard);

// Approved decorators only
router.patch('/project/status', hybridAuth, requireApprovedDecorator, updateStatus);
```

## User Model Extensions

### New Fields
- `firebaseUid` - Firebase user ID (unique)
- `photoURL` - Profile picture URL
- `phoneNumber` - Phone number
- `specialties` - Array of decorator specialties
- `rating` - Decorator rating (0-5)
- `totalProjects` - Number of completed projects
- `isApproved` - Decorator approval status

## Testing

### Test with JWT Token
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Use returned token
curl -X POST http://localhost:5001/api/bookings \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"userInfo":{"name":"Test","email":"test@example.com","phone":"123"},...}'
```

### Test with Firebase Token
```javascript
// In browser console (after Firebase initialization)
const token = await firebase.auth().currentUser.getIdToken();
console.log(token);

// Use this token in API requests
```

## Security Considerations

1. **Always use HTTPS in production**
2. **Store Firebase service account key securely**
3. **Rotate JWT secrets regularly**
4. **Validate all input data**
5. **Use role-based access control appropriately**
6. **Set proper token expiration times**

## Troubleshooting

### Firebase Token Verification Fails
- Check if `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly
- Ensure Firebase project ID matches
- Verify token is not expired

### JWT Token Verification Fails
- Check if `JWT_SECRET` is set
- Ensure token format is correct
- Verify token is not expired

### Role Access Denied
- Check user role in database
- For decorators, ensure `isApproved` is true
- Admin must manually assign roles

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return admin.app();
    }

    // Firebase configuration from client-side config
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCzV5pdIz1PtVllie5PyWbgXMJQI17JX94",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "smart-home-and-ceremony-dec.firebaseapp.com",
      projectId: process.env.FIREBASE_PROJECT_ID || "smart-home-and-ceremony-dec",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "smart-home-and-ceremony-dec.firebasestorage.app",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "373966472518",
      appId: process.env.FIREBASE_APP_ID || "1:373966472518:web:2b4aa33497c327827b1147"
    };

    // Initialize with service account (preferred for server)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebaseConfig.projectId
      });

      console.log('✅ Firebase Admin initialized with service account');
    } else {
      // Fallback: Initialize with application default credentials
      admin.initializeApp({
        projectId: firebaseConfig.projectId
      });

      console.log('⚠️ Firebase Admin initialized without service account');
      console.log('⚠️ Add FIREBASE_SERVICE_ACCOUNT_KEY to .env for full functionality');
    }

    return admin.app();
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
};

// Get Firebase Admin instance
const getFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    initializeFirebase();
  }
  return admin;
};

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  admin
};

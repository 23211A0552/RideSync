const admin = require('firebase-admin');

let db;
try {
  const serviceAccount = require('../../serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  db = admin.firestore();
  console.log('Firebase Admin initialized successfully!');
} catch (error) {
  console.error('Firebase Admin initialization error. Make sure you pasted your keys into serviceAccountKey.json!', error.message);
}

module.exports = { admin, db };

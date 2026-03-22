import { create } from 'zustand';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const useAuthStore = create((set, get) => ({
  user: null, 
  isAuthenticated: false,
  loading: true,

  initAuthListener: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user profile info from Firestore
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        let userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'Rider',
          photoURL: firebaseUser.photoURL || null,
        };
        
        if (docSnap.exists()) {
          userData = { ...userData, ...docSnap.data() };
        }
        
        set({ user: userData, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    });
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name on Firebase Auth object
      await updateProfile(userCredential.user, { displayName: name });
      
      // Save extra details in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        isDriver: false,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.message };
    }
  },

  logIn: async (email, password) => {
    set({ loading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.message };
    }
  },

  googleSignIn: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in db, if not create record
      const docRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
         await setDoc(docRef, {
            uid: result.user.uid,
            name: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            isDriver: false,
            createdAt: new Date().toISOString()
         });
      }
      return { success: true };
    } catch (error) {
       return { success: false, message: error.message };
    }
  },

  logOut: async () => {
    await signOut(auth);
    set({ user: null, isAuthenticated: false });
  }
}));

export default useAuthStore;

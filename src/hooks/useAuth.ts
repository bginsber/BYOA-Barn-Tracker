import { useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, Auth, ErrorFn } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UserProfile {
  email: string;
  createdAt: Date;
  lastLogin: Date;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!auth) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Authentication not initialized',
      });
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged(
      async (user: User | null) => {
        if (user) {
          // Update last login time
          try {
            await setDoc(doc(db, 'users', user.uid), {
              lastLogin: new Date(),
            }, { merge: true });
          } catch (error) {
            console.error('Error updating last login:', error);
          }
        }
        
        setAuthState({
          user,
          loading: false,
          error: null,
        });
      },
      ((error: Error) => {
        console.error('Auth state change error:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }) as ErrorFn
    );

    return () => unsubscribe();
  }, []);

  const handleAuthError = (error: unknown) => {
    const message = error instanceof FirebaseError 
      ? error.message 
      : 'An unexpected error occurred';
    
    setAuthState(prev => ({ 
      ...prev, 
      error: message,
      loading: false,
    }));
    return message;
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        createdAt: new Date(),
        lastLogin: new Date(),
      } as UserProfile);
      
    } catch (error) {
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await auth.signOut();
    } catch (error) {
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const errorMessage = handleAuthError(error);
      throw new Error(errorMessage);
    }
  };

  return { 
    ...authState, 
    signIn, 
    signUp, 
    signOut, 
    resetPassword 
  };
}; 
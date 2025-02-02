import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../../shared/services/api/apiClient';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

export class AuthService {
  static async login({ email, password }: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.transformFirebaseUser(userCredential.user);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async register({ email, password, displayName }: RegisterCredentials): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return this.transformFirebaseUser(userCredential.user);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  private static transformFirebaseUser(firebaseUser: any): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: new Date(firebaseUser.metadata.creationTime),
      lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime),
    };
  }

  private static handleAuthError(error: any): Error {
    const errorCode = error.code;
    let message = 'An unexpected error occurred';

    switch (errorCode) {
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Invalid password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account already exists with this email';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
    }

    return new Error(message);
  }
} 
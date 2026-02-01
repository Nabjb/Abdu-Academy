import { account, client, serverClient } from './client';
import { createUser, getUser, updateUser } from './helpers';
import { Account, Client } from 'node-appwrite';
import type { Models } from 'node-appwrite';

/**
 * Authentication utilities for Appwrite
 */

export interface AuthUser {
  $id: string;
  email: string;
  name?: string;
  role?: 'student' | 'instructor' | 'admin';
  avatar?: string;
}

/**
 * Register a new user
 * Note: Server-side SDK doesn't return session secrets, so we return the user info
 * The client should login separately after registration
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ userId: string; email: string; name: string }> {
  try {
    // Create a temporary client for account creation
    const tempClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
    
    const tempAccount = new Account(tempClient);
    
    // Create account in Appwrite (this creates the auth user)
    const user = await tempAccount.create('unique()', email, password, name);
    
    // Create user profile in database (server-side)
    await createUser({
      userId: user.$id,
      name,
      role: 'student', // Default role
    });

    // Return user info (client will login separately)
    return {
      userId: user.$id,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<Models.Session> {
  try {
    // Create a temporary client for session creation
    const tempClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
    
    const tempAccount = new Account(tempClient);
    
    // Create session (client-side operation)
    const session = await tempAccount.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Logout user
 */
export async function logoutUser(sessionSecret: string): Promise<void> {
  try {
    // Create a temporary client with session
    const tempClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
    
    tempClient.setSession(sessionSecret);
    
    const tempAccount = new Account(tempClient);
    
    // Get current session to get the session ID
    const session = await tempAccount.getSession('current');
    
    // Delete session using session ID
    await tempAccount.deleteSession(session.$id);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Get current user session
 */
export async function getCurrentSession(): Promise<Models.Session | null> {
  try {
    const session = await account.getSession('current');
    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Get current user with profile data
 */
export async function getCurrentUser(sessionSecret?: string): Promise<AuthUser | null> {
  try {
    let accountService = account;
    
    // Create temporary client with session if secret is provided (server-side)
    if (sessionSecret) {
      const tempClient = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
      
      tempClient.setSession(sessionSecret);
      accountService = new Account(tempClient);
    }
    
    const user = await accountService.get();
    
    // Get extended profile from database
    try {
      const profile = await getUser(user.$id);
      return {
        $id: user.$id,
        email: user.email,
        role: (profile as any).role as 'student' | 'instructor' | 'admin',
        name: (profile as any).name,
        avatar: (profile as any).avatar,
      } as AuthUser;
    } catch {
      // Profile doesn't exist yet, return basic user
      return {
        $id: user.$id,
        email: user.email,
      } as AuthUser;
    }
  } catch (error) {
    return null;
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  email: string,
  redirectUrl: string
): Promise<void> {
  try {
    await account.createRecovery(email, redirectUrl);
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  userId: string,
  secret: string,
  newPassword: string
): Promise<void> {
  try {
    await account.updateRecovery(userId, secret, newPassword);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  try {
    await account.updatePassword(newPassword, oldPassword);
  } catch (error) {
    console.error('Password update error:', error);
    throw error;
  }
}

/**
 * Verify email
 */
export async function verifyEmail(userId: string, secret: string): Promise<void> {
  try {
    await account.updateVerification(userId, secret);
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(
  email: string,
  redirectUrl: string
): Promise<void> {
  try {
    await account.createVerification(email);
  } catch (error) {
    console.error('Resend verification error:', error);
    throw error;
  }
}

/**
 * Check if user has role
 */
export async function hasRole(
  userId: string,
  role: 'student' | 'instructor' | 'admin'
): Promise<boolean> {
  try {
    const profile = await getUser(userId);
    return (profile as any).role === role;
  } catch {
    return false;
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'admin');
}

/**
 * Check if user is instructor
 */
export async function isInstructor(userId: string): Promise<boolean> {
  return hasRole(userId, 'instructor');
}

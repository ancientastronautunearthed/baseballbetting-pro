import crypto from 'crypto';
import { promisify } from 'util';

// Use crypto for password hashing
const scryptAsync = promisify(crypto.scrypt);

/**
 * Hashes a password using scrypt
 * @param password The plain text password to hash
 * @returns The hashed password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash the password
  const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
  
  // Return the salt and hash combined
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Compares a plain text password with a hashed password
 * @param password The plain text password to check
 * @param hashedPassword The hashed password to compare against
 * @returns True if the passwords match, false otherwise
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  // Extract salt and hash from stored password
  const [salt, storedHash] = hashedPassword.split(':');
  
  // Hash the input password with the same salt
  const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
  
  // Compare the hashes
  return crypto.timingSafeEqual(
    Buffer.from(storedHash, 'hex'),
    derivedKey
  );
}

/**
 * Generates a random token
 * @param length The length of the token
 * @returns A random token string
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validates a username
 * @param username The username to validate
 * @returns True if valid, false otherwise
 */
export function validateUsername(username: string): boolean {
  // Username must be at least 3 characters and only contain letters, numbers, and underscores
  return /^[a-zA-Z0-9_]{3,}$/.test(username);
}

/**
 * Validates an email address
 * @param email The email to validate
 * @returns True if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  // Basic email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates a password
 * @param password The password to validate
 * @returns True if valid, false otherwise
 */
export function validatePassword(password: string): boolean {
  // Password must be at least 8 characters
  return password.length >= 8;
}

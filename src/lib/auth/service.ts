import { postgres } from '../database/postgres';
import { hashPassword, verifyPassword, validatePassword } from './password';
import { generateToken, generateTokenHash, AuthUser } from './jwt';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  department: string;
  role?: 'staff' | 'manager' | 'admin' | 'auditor';
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { email, password } = credentials;

      // Validate input
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required',
        };
      }

      // Find user by email
      const userQuery = `
        SELECT id, email, password_hash, name, department, role, is_active
        FROM users 
        WHERE email = $1 AND is_active = true
      `;
      
      const result = await postgres.query(userQuery, [email.toLowerCase()]);
      
      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      const user = result.rows[0];

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password_hash);
      
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Update last login
      await postgres.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Generate JWT token
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      };

      const token = generateToken(authUser);

      // Store token hash in sessions table
      const tokenHash = generateTokenHash(token);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await postgres.query(
        `INSERT INTO user_sessions (user_id, token_hash, expires_at) 
         VALUES ($1, $2, $3)`,
        [user.id, tokenHash, expiresAt]
      );

      return {
        success: true,
        user: authUser,
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }

  /**
   * Register a new user
   */
  static async signup(userData: SignupData): Promise<AuthResult> {
    try {
      const { email, password, name, department, role = 'staff' } = userData;

      // Validate input
      if (!email || !password || !name) {
        return {
          success: false,
          error: 'Email, password, and name are required',
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors.join(', '),
        };
      }

      // Check if user already exists
      const existingUserQuery = 'SELECT id FROM users WHERE email = $1';
      const existingUser = await postgres.query(existingUserQuery, [email.toLowerCase()]);
      
      if (existingUser.rows.length > 0) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const insertUserQuery = `
        INSERT INTO users (email, password_hash, name, department, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, name, department, role
      `;

      const newUserResult = await postgres.query(insertUserQuery, [
        email.toLowerCase(),
        passwordHash,
        name,
        department,
        role,
      ]);

      const newUser = newUserResult.rows[0];

      // Generate JWT token
      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
      };

      const token = generateToken(authUser);

      // Store token hash in sessions table
      const tokenHash = generateTokenHash(token);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await postgres.query(
        `INSERT INTO user_sessions (user_id, token_hash, expires_at) 
         VALUES ($1, $2, $3)`,
        [newUser.id, tokenHash, expiresAt]
      );

      return {
        success: true,
        user: authUser,
        token,
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Registration failed',
      };
    }
  }

  /**
   * Logout user by invalidating token
   */
  static async logout(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const tokenHash = generateTokenHash(token);

      // Mark session as inactive
      await postgres.query(
        'UPDATE user_sessions SET is_active = false WHERE token_hash = $1',
        [tokenHash]
      );

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Logout failed',
      };
    }
  }

  /**
   * Validate if a token is still active
   */
  static async validateSession(token: string): Promise<boolean> {
    try {
      const tokenHash = generateTokenHash(token);

      const sessionQuery = `
        SELECT id FROM user_sessions 
        WHERE token_hash = $1 
        AND is_active = true 
        AND expires_at > CURRENT_TIMESTAMP
      `;

      const result = await postgres.query(sessionQuery, [tokenHash]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const userQuery = `
        SELECT id, email, name, department, role
        FROM users 
        WHERE id = $1 AND is_active = true
      `;
      
      const result = await postgres.query(userQuery, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}
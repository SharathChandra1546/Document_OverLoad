// Authentication module exports
export { AuthService } from './service';
export { generateToken, verifyToken, extractTokenFromHeader } from './jwt';
export { hashPassword, verifyPassword, validatePassword } from './password';
export { 
  authenticateRequest, 
  requireRole, 
  withAuth, 
  withAuthAndRole 
} from './middleware';

export type { 
  JWTPayload, 
  AuthUser 
} from './jwt';

export type { 
  LoginCredentials, 
  SignupData, 
  AuthResult 
} from './service';

export type { 
  AuthenticatedRequest 
} from './middleware';
/**
 * Simple test functions for authentication system
 * This is for development testing only
 */

import { AuthService } from './service';
import { generateToken, verifyToken } from './jwt';
import { hashPassword, verifyPassword } from './password';

export async function testAuthSystem() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Password hashing and verification
    console.log('1. Testing password hashing...');
    const testPassword = 'TestPassword123!';
    const hashedPassword = await hashPassword(testPassword);
    const isPasswordValid = await verifyPassword(testPassword, hashedPassword);
    console.log(`   ✅ Password hashing: ${isPasswordValid ? 'PASS' : 'FAIL'}`);

    // Test 2: JWT token generation and verification
    console.log('2. Testing JWT tokens...');
    const testUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'staff' as const,
      department: 'Testing',
    };
    
    const token = generateToken(testUser);
    const decoded = verifyToken(token);
    const isTokenValid = decoded.userId === testUser.id && decoded.email === testUser.email;
    console.log(`   ✅ JWT tokens: ${isTokenValid ? 'PASS' : 'FAIL'}`);

    // Test 3: User signup (if database is available)
    console.log('3. Testing user signup...');
    try {
      const signupResult = await AuthService.signup({
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User',
        department: 'Testing',
        role: 'staff',
      });
      console.log(`   ✅ User signup: ${signupResult.success ? 'PASS' : 'FAIL'}`);
      
      if (signupResult.success && signupResult.token) {
        // Test 4: Token validation
        console.log('4. Testing session validation...');
        const isSessionValid = await AuthService.validateSession(signupResult.token);
        console.log(`   ✅ Session validation: ${isSessionValid ? 'PASS' : 'FAIL'}`);
        
        // Test 5: Logout
        console.log('5. Testing logout...');
        const logoutResult = await AuthService.logout(signupResult.token);
        console.log(`   ✅ Logout: ${logoutResult.success ? 'PASS' : 'FAIL'}`);
      }
    } catch (error) {
      console.log(`   ❌ Database tests failed: ${error}`);
    }

    console.log('\n🎉 Authentication system tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for manual testing
export { testAuthSystem as default };
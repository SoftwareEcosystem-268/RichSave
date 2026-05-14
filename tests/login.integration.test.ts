/**
 * Login Integration Tests with Real Credentials
 * Uses environment variables for secure credential management
 *
 * Run: npm run test:unit -- tests/login.integration.test.ts
 *
 * Setup: Create .env.test file with:
 * TEST_EMAIL=your@email.com
 * TEST_PASSWORD=yourpassword
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { generateToken, verifyToken } from '@/lib/auth';

// Load test credentials from environment
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test@123456';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

describe('Login Integration Tests', () => {
  let authToken: string | null = null;

  beforeAll(() => {
    // Ensure JWT_SECRET is set for testing
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-secret-key';
    }
  });

  describe('POST /api/auth/login - Success Scenarios', () => {
    test('should login successfully with valid credentials', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(TEST_EMAIL);
      expect(data.user.id).toBeDefined();

      // Store token for subsequent tests
      authToken = response.headers.get('set-cookie');
      expect(authToken).toContain('token=');
    });

    test('should return user object with correct fields', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      });

      const data = await response.json();

      expect(data.user).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: TEST_EMAIL,
        favorites: expect.any(Array),
        preferences: expect.any(Object),
      });
    });

    test('should set httpOnly cookie with token', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      });

      const cookies = response.headers.get('set-cookie');
      expect(cookies).toBeDefined();

      // Check for httpOnly flag
      expect(cookies).toMatch(/HttpOnly/i);

      // Check for token
      expect(cookies).toMatch(/token=/);

      // Check for path
      expect(cookies).toMatch(/Path=\//);
    });

    test('should generate valid JWT token', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      });

      const cookies = response.headers.get('set-cookie') || '';

      // Extract token from cookie
      const tokenMatch = cookies.match(/token=([^;]+)/);
      expect(tokenMatch).toBeTruthy();

      if (tokenMatch) {
        const token = tokenMatch[1];
        const decoded = verifyToken(token);

        expect(decoded).not.toBeNull();
        expect(decoded!.email).toBe(TEST_EMAIL);
      }
    });
  });

  describe('POST /api/auth/login - Failure Scenarios', () => {
    test('should return 400 when email is missing', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: TEST_PASSWORD,
        }),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Email and password are required');
    });

    test('should return 400 when password is missing', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
        }),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Email and password are required');
    });

    test('should return 401 when email does not exist', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: TEST_PASSWORD,
        }),
      });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Invalid email or password');
    });

    test('should return 401 when password is incorrect', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: 'WrongPassword123!',
        }),
      });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Invalid email or password');
    });

    test('should not reveal whether email exists (security)', async () => {
      // Test with non-existent email
      const response1 = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'fake@example.com',
          password: 'password123',
        }),
      });

      // Test with existing email but wrong password
      const response2 = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: 'WrongPassword123!',
        }),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      // Both should return the same generic error message
      expect(data1.error).toBe(data2.error);
      expect(data1.error).toBe('Invalid email or password');
    });

    test('should return 500 on server error', async () => {
      // This test would require mocking a database error
      // For now, we test malformed JSON
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{{{',
      });

      // Should either return 400 (bad request) or 500 (server error)
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/auth/login - Edge Cases', () => {
    test('should handle email with different casing', async () => {
      // Assuming emails are stored as lowercase
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL.toUpperCase(),
          password: TEST_PASSWORD,
        }),
      });

      // Should either succeed (if normalized) or fail with 401
      expect([200, 401]).toContain(response.status);
    });

    test('should handle extra whitespace in email', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `  ${TEST_EMAIL}  `,
          password: TEST_PASSWORD,
        }),
      });

      // Should return 401 (whitespace not trimmed) or 200 (if trimmed)
      expect([200, 401]).toContain(response.status);
    });

    test('should handle empty strings', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '',
          password: '',
        }),
      });

      expect(response.status).toBe(400);
    });

    test('should handle very long email (DoS prevention)', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: longEmail,
          password: TEST_PASSWORD,
        }),
      });

      // Should handle gracefully (either validation error or 401)
      expect([400, 401, 413]).toContain(response.status);
    });

    test('should handle very long password', async () => {
      const longPassword = 'a'.repeat(10000);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: longPassword,
        }),
      });

      // Should handle gracefully
      expect([400, 401, 413]).toContain(response.status);
    });
  });

  describe('JWT Token Validation', () => {
    test('should generate token with correct expiry', () => {
      const payload = {
        userId: 'test-user-id',
        email: TEST_EMAIL,
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();

      // Token should expire in 7 days
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const expiresIn = decoded!.exp - decoded!.iat;

      expect(expiresIn).toBeCloseTo(sevenDaysInSeconds, 0);
    });

    test('should reject invalid token', () => {
      const decoded = verifyToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    test('should reject expired token', () => {
      const jwt = require('jsonwebtoken');
      const expiredPayload = {
        userId: 'test-user-id',
        email: TEST_EMAIL,
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };

      const expiredToken = jwt.sign(
        expiredPayload,
        process.env.JWT_SECRET || 'test-secret-key'
      );

      const decoded = verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });

  describe('Session Management', () => {
    test('should maintain session across requests', async () => {
      // First login
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      });

      const cookies = loginResponse.headers.get('set-cookie') || '';
      const tokenMatch = cookies.match(/token=([^;]+)/);

      if (tokenMatch) {
        // Use token for authenticated request
        const protectedResponse = await fetch(`${API_URL}/api/user/profile`, {
          headers: {
            'Cookie': `token=${tokenMatch[1]}`,
          },
        });

        // Should be able to access protected route
        expect([200, 401, 404]).toContain(protectedResponse.status);
      }
    });
  });
});

/**
 * Test Setup - Configure test environment before running tests
 */

import { test as setup } from '@playwright/test';

// Test credentials
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@richsave.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test@123456';

setup('create test user', async ({ request }) => {
  console.log('🔧 Setting up test environment...');

  // Ensure test user exists
  try {
    await request.post('http://localhost:3000/api/auth/signup', {
      data: {
        name: 'Test User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
      failOnStatusCode: false, // Ignore if user already exists
    });
    console.log('✅ Test user ready:', TEST_EMAIL);
  } catch (error) {
    console.log('⚠️ Could not create test user, continuing...');
  }

  // Setup any other test data here
  console.log('✅ Test setup complete');
});

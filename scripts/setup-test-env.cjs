/**
 * Setup Test Environment
 * Run before tests to ensure clean state
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up test environment...\n');

// 1. Check .env.test
if (!fs.existsSync('.env.test')) {
  console.log('⚠️  .env.test not found, copying from .env.test.example...');
  if (fs.existsSync('.env.test.example')) {
    fs.copyFileSync('.env.test.example', '.env.test');
    console.log('✅ Created .env.test\n');
  }
}

// 2. Load test credentials
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@richsave.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test@123456';

console.log('📋 Test Configuration:');
console.log(`   Email: ${TEST_EMAIL}`);
console.log(`   Password: ${TEST_PASSWORD}\n`);

// 3. Wait for server to be ready
console.log('⏳ Waiting for server...');
let retries = 0;
while (retries < 30) {
  try {
    execSync('curl -s http://localhost:3000 > nul', { stdio: 'ignore' });
    console.log('✅ Server is ready!\n');
    break;
  } catch {
    retries++;
    if (retries >= 30) {
      console.log('❌ Server not ready. Please run: npm run dev');
      process.exit(1);
    }
  }
}

// 4. Try to create test user
console.log('👤 Creating test user...');
try {
  execSync(`curl -s -X POST http://localhost:3000/api/auth/signup \\
    -H "Content-Type: application/json" \\
    -d '{"name":"Test User","email":"${TEST_EMAIL}","password":"${TEST_PASSWORD}"}' \\
    > nul 2>&1`, { stdio: 'ignore' });
  console.log('✅ Test user ready\n');
} catch {
  console.log('⚠️  Could not create user (may already exist)\n');
}

console.log('✅ Test environment ready!\n');
console.log('📝 To run tests:');
console.log('   npx playwright test --project=chromium\n');

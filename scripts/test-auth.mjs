/**
 * Authentication Test Script
 * 
 * Tests all authentication endpoints to verify Appwrite auth is working.
 * 
 * Usage:
 *   npm run test-auth
 * 
 * Prerequisites:
 *   - Dev server running on http://localhost:3000
 *   - Email/Password auth enabled in Appwrite Console
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';

let sessionCookie = null;

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null, useCookie = false) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  if (useCookie && sessionCookie) {
    options.headers['Cookie'] = sessionCookie;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // Extract cookies from response
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    }

    const data = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

// Test functions
async function testRegister() {
  console.log('\n📝 Testing Registration...');
  console.log(`   Email: ${TEST_EMAIL}`);
  console.log(`   Name: ${TEST_NAME}`);
  
  const result = await apiRequest('/api/auth/register', 'POST', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    name: TEST_NAME,
  });

  if (result.ok && result.data.success) {
    console.log('   ✅ Registration successful!');
    console.log(`   User ID: ${result.data.userId}`);
    return true;
  } else {
    console.log('   ❌ Registration failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.error}`);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  console.log(`   Email: ${TEST_EMAIL}`);
  
  const result = await apiRequest('/api/auth/login', 'POST', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (result.ok && result.data.success) {
    console.log('   ✅ Login successful!');
    console.log(`   User ID: ${result.data.userId}`);
    return true;
  } else {
    console.log('   ❌ Login failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.error}`);
    return false;
  }
}

async function testSession() {
  console.log('\n👤 Testing Session...');
  
  const result = await apiRequest('/api/auth/session', 'GET', null, true);

  if (result.ok && result.data.user) {
    console.log('   ✅ Session valid!');
    console.log(`   User: ${result.data.user.email}`);
    console.log(`   Name: ${result.data.user.name || 'N/A'}`);
    console.log(`   Role: ${result.data.user.role || 'N/A'}`);
    return true;
  } else {
    console.log('   ❌ Session check failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.error || 'No user data'}`);
    return false;
  }
}

async function testLogout() {
  console.log('\n🚪 Testing Logout...');
  
  const result = await apiRequest('/api/auth/logout', 'POST', null, true);

  if (result.ok && result.data.success) {
    console.log('   ✅ Logout successful!');
    sessionCookie = null; // Clear cookie
    return true;
  } else {
    console.log('   ❌ Logout failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${result.data.error || result.error}`);
    return false;
  }
}

async function testInvalidLogin() {
  console.log('\n🚫 Testing Invalid Login (should fail)...');
  
  const result = await apiRequest('/api/auth/login', 'POST', {
    email: 'invalid@example.com',
    password: 'WrongPassword123!',
  });

  if (!result.ok && result.status === 401) {
    console.log('   ✅ Correctly rejected invalid credentials');
    return true;
  } else {
    console.log('   ⚠️  Unexpected result');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

async function testDuplicateRegistration() {
  console.log('\n🔄 Testing Duplicate Registration (should fail)...');
  
  const result = await apiRequest('/api/auth/register', 'POST', {
    email: TEST_EMAIL, // Same email as before
    password: TEST_PASSWORD,
    name: TEST_NAME,
  });

  if (!result.ok && result.status === 409) {
    console.log('   ✅ Correctly rejected duplicate email');
    return true;
  } else {
    console.log('   ⚠️  Unexpected result');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Authentication Test Suite');
  console.log('='.repeat(50));
  console.log(`API Base URL: ${API_BASE}`);
  console.log(`Test Email: ${TEST_EMAIL}`);
  
  // Check if server is running
  try {
    const healthCheck = await fetch(`${API_BASE}/api/auth/session`);
    const status = healthCheck.status;
    // Accept 200, 401, or 500 (500 means server is running but might have errors)
    if (status >= 200 && status < 600) {
      console.log(`   Server is responding (status: ${status})`);
    } else {
      throw new Error('Server not responding');
    }
  } catch (error) {
    console.error('\n❌ Cannot connect to server!');
    console.error(`   Error: ${error.message}`);
    console.error('   Make sure the dev server is running:');
    console.error('   npm run dev');
    process.exit(1);
  }

  const results = {
    register: false,
    duplicateRegister: false,
    invalidLogin: false,
    login: false,
    session: false,
    logout: false,
  };

  // Run tests in sequence
  results.register = await testRegister();
  await new Promise(resolve => setTimeout(resolve, 500)); // Small delay

  results.duplicateRegister = await testDuplicateRegistration();
  await new Promise(resolve => setTimeout(resolve, 500));

  results.invalidLogin = await testInvalidLogin();
  await new Promise(resolve => setTimeout(resolve, 500));

  results.login = await testLogin();
  await new Promise(resolve => setTimeout(resolve, 500));

  results.session = await testSession();
  await new Promise(resolve => setTimeout(resolve, 500));

  results.logout = await testLogout();
  await new Promise(resolve => setTimeout(resolve, 500));

  // Final session check (should fail after logout)
  console.log('\n🔍 Testing Session After Logout (should fail)...');
  const finalSession = await apiRequest('/api/auth/session', 'GET', null, true);
  if (!finalSession.ok || !finalSession.data.user) {
    console.log('   ✅ Session correctly invalidated after logout');
  } else {
    console.log('   ⚠️  Session still valid after logout');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`   ${icon} ${test}`);
  });
  
  console.log(`\n   Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Authentication is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
    console.log('\n💡 Common issues:');
    console.log('   - Make sure Email/Password auth is enabled in Appwrite Console');
    console.log('   - Check that the dev server is running');
    console.log('   - Verify environment variables are set correctly');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Test suite error:', error);
  process.exit(1);
});

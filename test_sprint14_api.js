// Sprint 14 API Validation Script
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3003';

async function testSprint14API() {
  console.log('🧪 Sprint 14 API Validation\n');

  // Test 1: Health Check
  console.log('1. Testing API Health...');
  try {
    const healthResponse = await fetch(`${API_BASE}/api/words/health`);
    const healthData = await healthResponse.json();
    console.log('✅ API Health Check:', healthData);
  } catch (error) {
    console.log('❌ API Health Check Failed:', error.message);
  }

  // Test 2: Register New User
  console.log('\n2. Testing User Registration...');
  const testEmail = `test-${Date.now()}@example.com`;
  try {
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpass123'
      })
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful:', {
        userId: registerData.user.id,
        email: registerData.user.email,
        hasToken: !!registerData.token
      });
      
      // Test 3: Save Test Result with Auth Token
      console.log('\n3. Testing Authenticated Test Result Save...');
      const token = registerData.token;
      
      const testResult = {
        testResult: {
          wpm: 75,
          accuracy: 95.5,
          rawWpm: 78,
          consistency: 88,
          config: { mode: 'time', duration: 60 },
          tags: ['english1k', 'normal']
        }
      };
      
      const saveResponse = await fetch(`${API_BASE}/api/me/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testResult)
      });
      
      if (saveResponse.ok) {
        const saveData = await saveResponse.json();
        console.log('✅ Test result saved:', {
          id: saveData.id,
          wpm: saveData.wpm,
          accuracy: saveData.accuracy
        });
      } else {
        console.log('❌ Save test result failed:', saveResponse.status, await saveResponse.text());
      }
      
    } else {
      console.log('❌ Registration failed:', registerResponse.status, await registerResponse.text());
    }
  } catch (error) {
    console.log('❌ Registration Error:', error.message);
  }

  // Test 4: Login Flow
  console.log('\n4. Testing Login Flow...');
  try {
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpass123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', {
        userId: loginData.user.id,
        email: loginData.user.email,
        hasToken: !!loginData.token
      });
    } else {
      console.log('❌ Login failed:', loginResponse.status);
    }
  } catch (error) {
    console.log('❌ Login Error:', error.message);
  }

  console.log('\n✨ Sprint 14 API Validation Complete');
}

// Run the tests
testSprint14API().catch(console.error);
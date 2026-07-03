import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3002;
const BASE_URL = `http://localhost:${PORT}/api`;

const testEndpoints = async () => {
  console.log('======================================================');
  console.log('[TEST] Initiating backend endpoints verification test');
  console.log(`[TEST] Target Server URL: http://localhost:${PORT}`);
  console.log('======================================================\n');

  let testAdminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';
  let testAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'adminpassword123';
  let authToken = '';

  try {
    // 1. Check Root Endpoint
    console.log('[1/5] Testing server root connectivity...');
    const rootRes = await fetch(`http://localhost:${PORT}/`);
    if (!rootRes.ok) throw new Error(`Root connect failed with status ${rootRes.status}`);
    const rootData = await rootRes.json();
    console.log('✔ Connected! Server Response:', rootData.message);

    // 2. Check public page content endpoint
    console.log('\n[2/5] Testing public content retrieval (home section)...');
    const contentRes = await fetch(`${BASE_URL}/content/home`);
    if (!contentRes.ok) throw new Error(`Home content retrieve failed with status ${contentRes.status}`);
    const contentData = await contentRes.json();
    console.log('✔ Retained content! Heading:', contentData.data?.heading);

    // 3. Test contact message submission
    console.log('\n[3/5] Testing contact message submission validation...');
    const mockMessage = {
      name: 'Test Visitor',
      email: 'visitor@testmail.com',
      subject: 'Inquiry: API Verification',
      message: 'This is a mock message submitted by the test verification script.',
    };
    const messageRes = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockMessage),
    });
    if (!messageRes.ok) {
      const errorData = await messageRes.json();
      throw new Error(`Message submit failed: ${errorData.message}`);
    }
    const messageData = await messageRes.json();
    console.log('✔ Message sent successfully! Response:', messageData.message);

    // 4. Test admin login authentication
    console.log(`\n[4/5] Attempting login verification for user: ${testAdminEmail}...`);
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: testAdminPassword }),
    });
    if (!loginRes.ok) {
      const errorData = await loginRes.json();
      throw new Error(`Authentication failed: ${errorData.message}`);
    }
    const loginData = await loginRes.json();
    authToken = loginData.token;
    console.log('✔ Authenticated successfully! Token received:', authToken.slice(0, 20) + '...');

    // 5. Test session recovery using headers auth token
    console.log('\n[5/5] Testing session profile retrieval with auth token...');
    const sessionRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!sessionRes.ok) throw new Error(`Session verify failed with status ${sessionRes.status}`);
    const sessionData = await sessionRes.json();
    console.log('✔ Profile details fetched! User:', sessionData.user.name, `(${sessionData.user.role})`);

    console.log('\n======================================================');
    console.log('✔ SUCCESS: All backend endpoints tested successfully!');
    console.log('======================================================');
  } catch (error) {
    console.log('\n======================================================');
    console.error('❌ FAILURE: Endpoint verification test failed!');
    console.error('Reason:', error.message);
    console.log('======================================================');
    process.exit(1);
  }
};

// Wait 2 seconds to make sure database is ready
setTimeout(testEndpoints, 2000);

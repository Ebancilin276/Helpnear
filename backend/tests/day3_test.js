const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { pool } = require('../config/db');
const healthRoutes = require('../routes/healthRoutes');
const authRoutes = require('../routes/authRoutes');
const providerRoutes = require('../routes/providerRoutes');
const serviceRoutes = require('../routes/serviceRoutes');

// Build test app
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);

async function runTests() {
  const PORT = 5555;
  const server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}/api`;

  const results = [];
  const logTest = (num, name, passed, details) => {
    results.push({ num, name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[Test ${num}] ${mark}: ${name} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    console.log('\n=============================================');
    console.log('      HelpNear Day 3 Verification Tests       ');
    console.log('=============================================\n');

    const timestamp = Date.now();
    const providerEmail = `test_prov_${timestamp}@example.com`;
    const customerEmail = `test_cust_${timestamp}@example.com`;
    const testPassword = 'Password123!';

    // Setup: Register a fresh provider
    const regProvRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kumar Test Provider',
        email: providerEmail,
        password: testPassword,
        role: 'provider'
      })
    });
    const regProvData = await regProvRes.json();
    let providerToken = regProvData.token;

    // Setup: Register a fresh customer
    const regCustRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Priya Test Customer',
        email: customerEmail,
        password: testPassword,
        role: 'customer'
      })
    });
    const regCustData = await regCustRes.json();
    let customerToken = regCustData.token;

    // TEST 1: Existing health endpoint GET /api/health
    try {
      const res = await fetch(`${BASE_URL}/health`);
      const data = await res.json();
      const pass = res.status === 200 && data.success === true;
      logTest(1, 'GET /api/health', pass, `status ${res.status}, message: "${data.message}"`);
    } catch (e) {
      logTest(1, 'GET /api/health', false, e.message);
    }

    // TEST 2: Existing login endpoint POST /api/auth/login
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: providerEmail,
          password: testPassword
        })
      });
      const data = await res.json();
      const pass = res.status === 200 && data.success === true && !!data.token && data.user.role === 'provider';
      if (pass) providerToken = data.token; // Refresh token
      logTest(2, 'POST /api/auth/login', pass, `status ${res.status}, token issued`);
    } catch (e) {
      logTest(2, 'POST /api/auth/login', false, e.message);
    }

    // TEST 3: Provider profile creation POST /api/providers/profile with valid provider JWT
    let createdProviderId = null;
    try {
      const res = await fetch(`${BASE_URL}/providers/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerToken}`
        },
        body: JSON.stringify({
          business_name: 'John Electrical Services',
          phone: '9876543210',
          description: 'Electrical repair and installation services',
          address: 'Main Road',
          city: 'Coimbatore',
          latitude: 11.0168,
          longitude: 76.9558
        })
      });
      const data = await res.json();
      const pass = res.status === 201 && 
                   data.success === true && 
                   data.provider.business_name === 'John Electrical Services' &&
                   data.provider.city === 'Coimbatore' &&
                   data.provider.is_verified === false &&
                   data.provider.is_available === true;
      if (pass) createdProviderId = data.provider.id;
      logTest(3, 'POST /api/providers/profile', pass, `status ${res.status}, profile ID ${createdProviderId}`);
    } catch (e) {
      logTest(3, 'POST /api/providers/profile', false, e.message);
    }

    // TEST 4: Get own profile GET /api/providers/profile
    try {
      const res = await fetch(`${BASE_URL}/providers/profile`, {
        headers: {
          'Authorization': `Bearer ${providerToken}`
        }
      });
      const data = await res.json();
      const pass = res.status === 200 && 
                   data.success === true && 
                   data.provider.business_name === 'John Electrical Services' &&
                   data.provider.password === undefined && // No password leakage!
                   data.provider.phone === '9876543210';
      logTest(4, 'GET /api/providers/profile', pass, `status ${res.status}, business: ${data.provider?.business_name}`);
    } catch (e) {
      logTest(4, 'GET /api/providers/profile', false, e.message);
    }

    // TEST 5: Update profile PUT /api/providers/profile
    try {
      const res = await fetch(`${BASE_URL}/providers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerToken}`
        },
        body: JSON.stringify({
          description: 'Updated 24/7 electrical repairs',
          is_available: false,
          is_verified: true // Must be ignored / not changeable
        })
      });
      const data = await res.json();
      const pass = res.status === 200 && 
                   data.success === true && 
                   data.provider.description === 'Updated 24/7 electrical repairs' &&
                   data.provider.is_available === false &&
                   data.provider.is_verified === false; // Ensured cannot be manually set to true!
      logTest(5, 'PUT /api/providers/profile', pass, `status ${res.status}, is_available: false, is_verified intact: false`);
    } catch (e) {
      logTest(5, 'PUT /api/providers/profile', false, e.message);
    }

    // Restore availability to true for listing tests
    await fetch(`${BASE_URL}/providers/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({ is_available: true })
    });

    // TEST 6: Get categories GET /api/services/categories
    let electricianCatId = 1;
    let carpenterCatId = 3;
    try {
      const res = await fetch(`${BASE_URL}/services/categories`);
      const data = await res.json();
      const pass = res.status === 200 && 
                   data.success === true && 
                   Array.isArray(data.categories) && 
                   data.categories.length >= 15;
      const elec = data.categories?.find(c => c.name.toLowerCase() === 'electrician');
      const carp = data.categories?.find(c => c.name.toLowerCase() === 'carpenter');
      if (elec) electricianCatId = elec.id;
      if (carp) carpenterCatId = carp.id;
      logTest(6, 'GET /api/services/categories', pass, `status ${res.status}, categories count: ${data.categories?.length}`);
    } catch (e) {
      logTest(6, 'GET /api/services/categories', false, e.message);
    }

    // TEST 7: Add provider services POST /api/providers/services
    try {
      const res = await fetch(`${BASE_URL}/providers/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerToken}`
        },
        body: JSON.stringify({
          service_category_ids: [electricianCatId, carpenterCatId]
        })
      });
      const data = await res.json();
      const pass = res.status === 200 && 
                   data.success === true && 
                   Array.isArray(data.services) &&
                   data.services.length === 2;
      logTest(7, 'POST /api/providers/services', pass, `status ${res.status}, assigned ${data.services?.length} services`);
    } catch (e) {
      logTest(7, 'POST /api/providers/services', false, e.message);
    }

    // TEST 8: Get provider services GET /api/providers/services
    try {
      const res = await fetch(`${BASE_URL}/providers/services`, {
        headers: {
          'Authorization': `Bearer ${providerToken}`
        }
      });
      const data = await res.json();
      const pass = res.status === 200 && 
                   data.success === true && 
                   Array.isArray(data.services) &&
                   data.services.some(s => s.name === 'Electrician');
      logTest(8, 'GET /api/providers/services', pass, `status ${res.status}, services: ${data.services?.map(s => s.name).join(', ')}`);
    } catch (e) {
      logTest(8, 'GET /api/providers/services', false, e.message);
    }

    // TEST 9: Public provider listing GET /api/providers
    try {
      const res = await fetch(`${BASE_URL}/providers`);
      const data = await res.json();
      const targetProv = data.providers?.find(p => p.id === createdProviderId);
      const pass = res.status === 200 && 
                   data.success === true && 
                   Array.isArray(data.providers) &&
                   targetProv !== undefined &&
                   targetProv.business_name === 'John Electrical Services' &&
                   Array.isArray(targetProv.services) &&
                   targetProv.password === undefined && // No sensitive security leaks
                   targetProv.latitude === undefined;  // No private coordinates exposed
      logTest(9, 'GET /api/providers (Public Directory)', pass, `status ${res.status}, total providers: ${data.providers?.length}`);
    } catch (e) {
      logTest(9, 'GET /api/providers', false, e.message);
    }

    // TEST 10: City filter GET /api/providers?city=Coimbatore
    try {
      const res = await fetch(`${BASE_URL}/providers?city=Coimbatore`);
      const data = await res.json();
      const pass = res.status === 200 && 
                   data.success === true && 
                   data.providers.length > 0 &&
                   data.providers.every(p => p.city.toLowerCase() === 'coimbatore');
      logTest(10, 'GET /api/providers?city=Coimbatore', pass, `status ${res.status}, matches: ${data.providers?.length}`);
    } catch (e) {
      logTest(10, 'GET /api/providers?city=Coimbatore', false, e.message);
    }

    // TEST 11: Service filter GET /api/providers?service=Electrician
    try {
      const res = await fetch(`${BASE_URL}/providers?service=Electrician`);
      const data = await res.json();
      const pass = res.status === 200 && 
                   data.success === true && 
                   data.providers.length > 0 &&
                   data.providers.some(p => p.id === createdProviderId);
      logTest(11, 'GET /api/providers?service=Electrician', pass, `status ${res.status}, matches: ${data.providers?.length}`);
    } catch (e) {
      logTest(11, 'GET /api/providers?service=Electrician', false, e.message);
    }

    // TEST 12: Customer security test: Try provider-only API using customer JWT -> Must return HTTP 403
    try {
      const resProfile = await fetch(`${BASE_URL}/providers/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify({
          business_name: 'Unauthorized Customer Service',
          phone: '1234567890'
        })
      });
      const dataProfile = await resProfile.json();

      const resServices = await fetch(`${BASE_URL}/providers/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify({ service_category_ids: [1] })
      });

      const pass = resProfile.status === 403 && 
                   dataProfile.success === false && 
                   resServices.status === 403;
      logTest(12, 'Customer Security Test (HTTP 403 on Provider API)', pass, `POST /profile: ${resProfile.status}, POST /services: ${resServices.status}`);
    } catch (e) {
      logTest(12, 'Customer Security Test', false, e.message);
    }

    console.log('\n---------------------------------------------');
    const allPassed = results.every(r => r.passed);
    console.log(`SUMMARY: ${results.filter(r => r.passed).length} / ${results.length} tests passed.`);
    if (allPassed) {
      console.log('🎉 ALL 12 TESTS PASSED PERFECTLY!\n');
    } else {
      console.log('❌ SOME TESTS FAILED.\n');
    }

    server.close();
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Test suite error:', err);
    server.close();
    process.exit(1);
  }
}

runTests();

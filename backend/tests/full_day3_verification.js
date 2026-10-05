const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { pool } = require('../config/db');

const BASE_URL = 'http://localhost:5000/api';

async function runAll18Tests() {
  console.log('===============================================================');
  console.log('       HelpNear Day 3 Comprehensive 18-Point Verification      ');
  console.log('===============================================================\n');

  const results = [];
  const record = (index, name, passed, details) => {
    results.push({ index, name, passed, details });
    const icon = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[Test ${String(index).padStart(2, ' ')}/18] ${icon} - ${name}`);
    if (details) console.log(`              Details: ${details}`);
  };

  const timestamp = Date.now();
  const providerEmail = `prov_test_${timestamp}@helpnear.test`;
  const customerEmail = `cust_test_${timestamp}@helpnear.test`;
  const testPassword = 'SecurePassword123!';
  let providerToken = null;
  let customerToken = null;
  let providerUserId = null;
  let customerUserId = null;
  let createdProviderId = null;
  let electricianCatId = null;
  let plumberCatId = null;

  try {
    // 1. GET /api/health
    try {
      const res = await fetch(`${BASE_URL}/health`);
      const data = await res.json();
      const pass = res.status === 200 && data.success === true && data.message.includes('HelpNear');
      record(1, 'GET /api/health', pass, `HTTP ${res.status}, message: "${data.message}"`);
    } catch (e) {
      record(1, 'GET /api/health', false, e.message);
    }

    // 2. Day 2 register
    try {
      // Register Provider
      const resProv = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ramesh Sharma',
          email: providerEmail,
          password: testPassword,
          role: 'provider'
        })
      });
      const dataProv = await resProv.json();

      // Register Customer
      const resCust = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Anita Roy',
          email: customerEmail,
          password: testPassword,
          role: 'customer'
        })
      });
      const dataCust = await resCust.json();

      const pass = resProv.status === 201 && 
                   dataProv.success === true && 
                   dataProv.user.role === 'provider' &&
                   dataProv.token &&
                   resCust.status === 201 && 
                   dataCust.success === true && 
                   dataCust.user.role === 'customer' &&
                   dataCust.token;

      if (pass) {
        providerToken = dataProv.token;
        customerToken = dataCust.token;
        providerUserId = dataProv.user.id;
        customerUserId = dataCust.user.id;
      }
      record(2, 'Day 2 register (Provider & Customer)', pass, `Provider ID: ${providerUserId}, Customer ID: ${customerUserId}`);
    } catch (e) {
      record(2, 'Day 2 register', false, e.message);
    }

    // 3. Day 2 login
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
      const pass = res.status === 200 && 
                   data.success === true && 
                   Boolean(data.token) &&
                   data.user.email === providerEmail &&
                   data.user.password === undefined; // Never leak password!
      if (pass) providerToken = data.token;
      record(3, 'Day 2 login', pass, `HTTP ${res.status}, JWT issued, password excluded`);
    } catch (e) {
      record(3, 'Day 2 login', false, e.message);
    }

    // 4. GET /api/auth/me
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${providerToken}` }
      });
      const data = await res.json();
      const pass = res.status === 200 && 
                   data.success === true && 
                   data.user.id === providerUserId &&
                   data.user.email === providerEmail &&
                   data.user.role === 'provider';
      record(4, 'GET /api/auth/me (Protected Route)', pass, `HTTP ${res.status}, verified user "${data.user?.name}" (${data.user?.role})`);
    } catch (e) {
      record(4, 'GET /api/auth/me', false, e.message);
    }

    // 5. Provider profile creation POST /api/providers/profile
    try {
      const res = await fetch(`${BASE_URL}/providers/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerToken}`
        },
        body: JSON.stringify({
          business_name: 'Sharma Express Electricals',
          phone: '9845012345',
          description: 'Specialist in 24/7 domestic electrical repair and wiring in Coimbatore',
          address: '77 Cross Cut Road',
          city: 'Coimbatore',
          latitude: 11.016844,
          longitude: 76.955832,
          is_verified: true // Must be rejected / forced to false by backend
        })
      });
      const data = await res.json();
      const pass = res.status === 201 &&
                   data.success === true &&
                   data.provider &&
                   data.provider.business_name === 'Sharma Express Electricals' &&
                   data.provider.city === 'Coimbatore' &&
                   data.provider.is_verified === false && // Must NOT allow provider to self-verify!
                   data.provider.is_available === true;
      if (pass) createdProviderId = data.provider.id;
      record(5, 'Provider profile creation (POST /api/providers/profile)', pass, `HTTP ${res.status}, profile ID ${createdProviderId}, is_verified = false (read-only enforced)`);
    } catch (e) {
      record(5, 'Provider profile creation', false, e.message);
    }

    // 6. Provider profile update PUT /api/providers/profile
    try {
      const res = await fetch(`${BASE_URL}/providers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerToken}`
        },
        body: JSON.stringify({
          description: 'Updated 24/7 master electrician & emergency fault detection',
          is_available: false,
          is_verified: true, // Should remain false
          user_id: 99999     // Should NOT change user_id
        })
      });
      const data = await res.json();
      const pass = res.status === 200 &&
                   data.success === true &&
                   data.provider.description === 'Updated 24/7 master electrician & emergency fault detection' &&
                   data.provider.is_available === false &&
                   data.provider.is_verified === false && // Guaranteed read-only
                   data.provider.user_id === providerUserId; // Cannot hijack user_id

      // Switch availability back to true for directory listing tests
      await fetch(`${BASE_URL}/providers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerToken}`
        },
        body: JSON.stringify({ is_available: true })
      });

      record(6, 'Provider profile update (PUT /api/providers/profile)', pass, `HTTP ${res.status}, is_available updated, is_verified & user_id protected`);
    } catch (e) {
      record(6, 'Provider profile update', false, e.message);
    }

    // 7. Get service categories GET /api/services/categories
    try {
      const res = await fetch(`${BASE_URL}/services/categories`);
      const data = await res.json();
      const pass = res.status === 200 &&
                   data.success === true &&
                   Array.isArray(data.categories) &&
                   data.categories.length >= 15;
      
      const elec = data.categories.find(c => c.name.toLowerCase() === 'electrician');
      const plum = data.categories.find(c => c.name.toLowerCase() === 'plumber');
      if (elec) electricianCatId = elec.id;
      if (plum) plumberCatId = plum.id;

      record(7, 'Get service categories (GET /api/services/categories)', pass, `HTTP ${res.status}, returned ${data.categories?.length} categories`);
    } catch (e) {
      record(7, 'Get service categories', false, e.message);
    }

    // 8. Add provider services POST /api/providers/services
    try {
      const res = await fetch(`${BASE_URL}/providers/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerToken}`
        },
        body: JSON.stringify({
          service_category_ids: [electricianCatId, plumberCatId, electricianCatId] // Testing deduplication!
        })
      });
      const data = await res.json();
      const pass = res.status === 200 &&
                   data.success === true &&
                   Array.isArray(data.services) &&
                   data.services.length === 2 && // Deduplicated from 3 items to 2
                   data.services.some(s => s.name.toLowerCase() === 'electrician') &&
                   data.services.some(s => s.name.toLowerCase() === 'plumber');
      record(8, 'Add provider services (POST /api/providers/services)', pass, `HTTP ${res.status}, assigned ${data.services?.length} services (deduplication verified)`);
    } catch (e) {
      record(8, 'Add provider services', false, e.message);
    }

    // 9. Get provider services GET /api/providers/services
    try {
      const res = await fetch(`${BASE_URL}/providers/services`, {
        headers: { 'Authorization': `Bearer ${providerToken}` }
      });
      const data = await res.json();
      const pass = res.status === 200 &&
                   data.success === true &&
                   Array.isArray(data.services) &&
                   data.services.length === 2 &&
                   data.services.map(s => s.name).includes('Electrician');
      record(9, 'Get provider services (GET /api/providers/services)', pass, `HTTP ${res.status}, services: ${data.services?.map(s => s.name).join(', ')}`);
    } catch (e) {
      record(9, 'Get provider services', false, e.message);
    }

    // 10. Public provider listing GET /api/providers
    try {
      const res = await fetch(`${BASE_URL}/providers`);
      const data = await res.json();
      const target = data.providers?.find(p => p.id === createdProviderId);
      const pass = res.status === 200 &&
                   data.success === true &&
                   Array.isArray(data.providers) &&
                   target !== undefined &&
                   target.business_name === 'Sharma Express Electricals' &&
                   target.password === undefined && // No credentials leakage
                   target.latitude === undefined && // No private coordinate leaks
                   Array.isArray(target.services);
      record(10, 'Public provider listing (GET /api/providers)', pass, `HTTP ${res.status}, total providers: ${data.providers?.length}, zero security leaks`);
    } catch (e) {
      record(10, 'Public provider listing', false, e.message);
    }

    // 11. City filter GET /api/providers?city=Coimbatore
    try {
      const res = await fetch(`${BASE_URL}/providers?city=Coimbatore`);
      const data = await res.json();
      const pass = res.status === 200 &&
                   data.success === true &&
                   data.providers.length > 0 &&
                   data.providers.every(p => p.city.toLowerCase() === 'coimbatore');
      record(11, 'City filter (GET /api/providers?city=Coimbatore)', pass, `HTTP ${res.status}, matched ${data.providers?.length} providers in Coimbatore`);
    } catch (e) {
      record(11, 'City filter', false, e.message);
    }

    // 12. Service filter GET /api/providers?service=Electrician
    try {
      const res = await fetch(`${BASE_URL}/providers?service=Electrician`);
      const data = await res.json();
      const pass = res.status === 200 &&
                   data.success === true &&
                   data.providers.length > 0 &&
                   data.providers.some(p => p.id === createdProviderId);
      record(12, 'Service filter (GET /api/providers?service=Electrician)', pass, `HTTP ${res.status}, matched ${data.providers?.length} providers offering Electrician`);
    } catch (e) {
      record(12, 'Service filter', false, e.message);
    }

    // 13. City + service filter GET /api/providers?city=Coimbatore&service=Electrician
    try {
      const res = await fetch(`${BASE_URL}/providers?city=Coimbatore&service=Electrician`);
      const data = await res.json();
      const pass = res.status === 200 &&
                   data.success === true &&
                   data.providers.length > 0 &&
                   data.providers.every(p => p.city.toLowerCase() === 'coimbatore') &&
                   data.providers.some(p => p.id === createdProviderId);
      record(13, 'City + service filter (GET /api/providers?city=Coimbatore&service=Electrician)', pass, `HTTP ${res.status}, matched ${data.providers?.length} dual-filtered providers`);
    } catch (e) {
      record(13, 'City + service filter', false, e.message);
    }

    // 14. Customer attempting provider-only API -> Must return HTTP 403
    try {
      const resProfile = await fetch(`${BASE_URL}/providers/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify({
          business_name: 'Illegal Customer Service',
          phone: '9999999999'
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
      record(14, 'Customer attempting provider-only API (HTTP 403 Forbidden)', pass, `POST /profile: HTTP ${resProfile.status}, POST /services: HTTP ${resServices.status}`);
    } catch (e) {
      record(14, 'Customer attempting provider-only API', false, e.message);
    }

    // 15. Invalid / missing JWT -> Must return HTTP 401
    try {
      const resNoToken = await fetch(`${BASE_URL}/providers/profile`);
      const resBadToken = await fetch(`${BASE_URL}/providers/profile`, {
        headers: { 'Authorization': 'Bearer bad_invalid_token_12345' }
      });
      const pass = resNoToken.status === 401 && resBadToken.status === 401;
      record(15, 'Invalid/missing JWT (HTTP 401 Unauthorized)', pass, `No token: HTTP ${resNoToken.status}, Bad token: HTTP ${resBadToken.status}`);
    } catch (e) {
      record(15, 'Invalid/missing JWT', false, e.message);
    }

    // 16. Verify frontend provider profile
    try {
      const profilePath = path.join(__dirname, '..', '..', 'frontend', 'src', 'pages', 'ProviderProfile.jsx');
      const content = fs.readFileSync(profilePath, 'utf8');
      const hasBusinessName = content.includes('business_name');
      const hasPhone = content.includes('phone');
      const hasDescription = content.includes('description');
      const hasAddress = content.includes('address');
      const hasCity = content.includes('city');
      const hasLatLon = content.includes('latitude') && content.includes('longitude');
      const hasAvailability = content.includes('is_available') && content.includes('toggleAvailability');
      const hasReadOnlyVerify = content.includes('is_verified') && content.includes('Read-Only');

      const pass = hasBusinessName && hasPhone && hasDescription && hasAddress && hasCity && hasLatLon && hasAvailability && hasReadOnlyVerify;
      record(16, 'Verify frontend provider profile (ProviderProfile.jsx)', pass, 'Form fields, availability toggle, and read-only is_verified badge confirmed');
    } catch (e) {
      record(16, 'Verify frontend provider profile', false, e.message);
    }

    // 17. Verify frontend provider services
    try {
      const servicesPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'pages', 'ProviderServices.jsx');
      const content = fs.readFileSync(servicesPath, 'utf8');
      const hasGetCategories = content.includes('api.getCategories');
      const hasGetServices = content.includes('api.getProviderServices');
      const hasSaveServices = content.includes('api.saveProviderServices');
      const hasCategorySelect = content.includes('toggleCategory') && content.includes('selectedIds');
      const hasActiveDisplay = content.includes('initialLoadedServices');

      const pass = hasGetCategories && hasGetServices && hasSaveServices && hasCategorySelect && hasActiveDisplay;
      record(17, 'Verify frontend provider services (ProviderServices.jsx)', pass, 'Fetches categories, interactive selection, saves to backend, displays active services');
    } catch (e) {
      record(17, 'Verify frontend provider services', false, e.message);
    }

    // 18. Verify frontend provider listing
    try {
      const providersPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'pages', 'Providers.jsx');
      const content = fs.readFileSync(providersPath, 'utf8');
      const hasGetProviders = content.includes('api.getProviders');
      const hasCityFilter = content.includes('city') && content.includes('handleCitySearch');
      const hasServiceFilter = content.includes('service') && content.includes('handleServiceChange');
      const hasBusinessDisplay = content.includes('business_name');
      const hasCityDisplay = content.includes('provider.city');
      const hasDescDisplay = content.includes('provider.description');
      const hasSvcDisplay = content.includes('provider.services');
      const hasAvailDisplay = content.includes('is_available');
      const hasVerifyDisplay = content.includes('is_verified');

      const pass = hasGetProviders && hasCityFilter && hasServiceFilter && hasBusinessDisplay && hasCityDisplay && hasDescDisplay && hasSvcDisplay && hasAvailDisplay && hasVerifyDisplay;
      record(18, 'Verify frontend provider listing (Providers.jsx)', pass, 'Real backend fetching, city/service filters, cards with all required fields & status badges');
    } catch (e) {
      record(18, 'Verify frontend provider listing', false, e.message);
    }

    console.log('\n===============================================================');
    const passedCount = results.filter(r => r.passed).length;
    console.log(`TOTAL RESULT: ${passedCount} / ${results.length} CHECKS PASSED.`);
    console.log('===============================================================\n');

    if (passedCount === results.length) {
      console.log('🎉 ALL 18 DAY 3 VERIFICATION TESTS PASSED 100% SUCCESSFULLY!\n');
      process.exit(0);
    } else {
      console.error('❌ SOME TESTS FAILED.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runAll18Tests();

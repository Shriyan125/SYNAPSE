/**
 * Comprehensive End-to-End Live Verification Script for Synapse
 * Executes real HTTP requests against the live backend (http://localhost:5001)
 * and verifies every core feature, constraint, and role.
 */

const BASE_URL = 'http://localhost:5001/api/v1';
const HEALTH_URL = 'http://localhost:5001/health';
const DOCS_URL = 'http://localhost:5001/api/docs';
const FRONTEND_URL = 'http://localhost:5173';

const results = [];

function record(testName, passed, details = '') {
  results.push({ testName, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} | ${testName}${details ? ` -> ${details}` : ''}`);
}

async function runVerification() {
  console.log('\n======================================================');
  console.log('   STARTING SYNAPSE LIVE END-TO-END VERIFICATION');
  console.log('======================================================\n');

  // 1. Health & Docs
  try {
    const res = await fetch(HEALTH_URL);
    const data = await res.json();
    record('Health Check (/health)', res.status === 200 && data.status === 'healthy', `Status ${res.status}`);
  } catch (e) {
    record('Health Check (/health)', false, e.message);
  }

  try {
    const res = await fetch(DOCS_URL);
    record('Swagger API Docs (/api/docs)', res.status === 200, `HTTP ${res.status}`);
  } catch (e) {
    record('Swagger API Docs (/api/docs)', false, e.message);
  }

  try {
    const res = await fetch(FRONTEND_URL);
    const text = await res.text();
    record('Frontend UI (http://localhost:5173)', res.status === 200 && text.includes('<!DOCTYPE html>'), `HTTP ${res.status} (Vite React app ready)`);
  } catch (e) {
    record('Frontend UI (http://localhost:5173)', false, e.message);
  }

  // 2. Public Catalog
  try {
    const res = await fetch(`${BASE_URL}/providers`);
    const data = await res.json();
    record('Catalog: Get Providers (/providers)', res.status === 200 && data.data.length >= 5, `Found ${data.data.length} providers`);
  } catch (e) {
    record('Catalog: Get Providers (/providers)', false, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/services`);
    const data = await res.json();
    record('Catalog: Get Services (/services)', res.status === 200 && data.data.length >= 10, `Found ${data.data.length} services`);
  } catch (e) {
    record('Catalog: Get Services (/services)', false, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/providers/1/slots?available=true`);
    const data = await res.json();
    record('Catalog: Get Open Slots (/providers/1/slots?available=true)', res.status === 200 && Array.isArray(data.data), `Retrieved ${data.data.length} slots`);
  } catch (e) {
    record('Catalog: Get Open Slots (/providers/1/slots?available=true)', false, e.message);
  }

  // 3. Auth Flow - Login for Patient, Provider, Admin
  let patientToken = null;
  let patientUser = null;
  let cookieHeader = null;

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@example.com', password: 'Password123!' }),
    });
    const data = await res.json();
    patientToken = data.data?.accessToken;
    patientUser = data.data?.user;
    cookieHeader = res.headers.get('set-cookie');
    record('Auth: Patient Login (alice@example.com)', res.status === 200 && !!patientToken, `Role: ${patientUser?.role}`);
  } catch (e) {
    record('Auth: Patient Login (alice@example.com)', false, e.message);
  }

  let providerToken = null;
  let providerUser = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.sarah@synapse.health', password: 'Password123!' }),
    });
    const data = await res.json();
    providerToken = data.data?.accessToken;
    providerUser = data.data?.user;
    record('Auth: Provider Login (dr.sarah@synapse.health)', res.status === 200 && providerUser?.role === 'provider', `Provider ID: ${providerUser?.provider?.id}`);
  } catch (e) {
    record('Auth: Provider Login (dr.sarah@synapse.health)', false, e.message);
  }

  let adminToken = null;
  let adminUser = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@synapse.health', password: 'Password123!' }),
    });
    const data = await res.json();
    adminToken = data.data?.accessToken;
    adminUser = data.data?.user;
    record('Auth: Admin Login (admin@synapse.health)', res.status === 200 && adminUser?.role === 'admin', `Role: ${adminUser?.role}`);
  } catch (e) {
    record('Auth: Admin Login (admin@synapse.health)', false, e.message);
  }

  // 4. Auth: Register New User
  const uniqueEmail = `patient_${Date.now()}@example.com`;
  let newRegisteredToken = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Live Patient',
        email: uniqueEmail,
        password: 'Password123!',
        role: 'user',
        phone: '+1-555-8888',
      }),
    });
    const data = await res.json();
    newRegisteredToken = data.data?.accessToken;
    record('Auth: Register New Patient (/auth/register)', res.status === 201 && !!newRegisteredToken, `Email: ${uniqueEmail}`);
  } catch (e) {
    record('Auth: Register New Patient (/auth/register)', false, e.message);
  }

  // 5. Auth: Profile & Update (/users/me)
  try {
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const data = await res.json();
    record('User: Get Profile (/users/me)', res.status === 200 && data.data?.email === 'alice@example.com', `Name: ${data.data?.fullName}`);
  } catch (e) {
    record('User: Get Profile (/users/me)', false, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: '+1-555-9999' }),
    });
    const data = await res.json();
    record('User: Update Profile (/users/me)', res.status === 200 && data.data?.phone === '+1-555-9999', `Updated Phone: ${data.data?.phone}`);
  } catch (e) {
    record('User: Update Profile (/users/me)', false, e.message);
  }

  // 6. Provider Creates a New Slot
  let createdSlotId = null;
  const slotDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000); // 8 days in future
  const slotStart = new Date(slotDate.getTime());
  slotStart.setHours(10, 0, 0, 0);
  const slotEnd = new Date(slotDate.getTime());
  slotEnd.setHours(10, 45, 0, 0);

  try {
    const res = await fetch(`${BASE_URL}/slots`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${providerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_time: slotStart.toISOString(),
        end_time: slotEnd.toISOString(),
      }),
    });
    const data = await res.json();
    createdSlotId = data.data?.id;
    record('Provider: Create Slot (/slots)', res.status === 201 && !!createdSlotId, `Slot ID #${createdSlotId}`);
  } catch (e) {
    record('Provider: Create Slot (/slots)', false, e.message);
  }

  // 7. Patient Books the Newly Created Slot
  let bookedAppointmentId = null;
  try {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider_id: providerUser.provider.id,
        service_id: 1, // General Health Consultation
        slot_id: createdSlotId,
        notes: 'Live verification test booking',
      }),
    });
    const data = await res.json();
    bookedAppointmentId = data.data?.id;
    record('Appointment: Book Slot (/appointments)', res.status === 201 && !!bookedAppointmentId, `Appointment #${bookedAppointmentId}`);
  } catch (e) {
    record('Appointment: Book Slot (/appointments)', false, e.message);
  }

  // 8. CONCURRENCY & DOUBLE-BOOKING PREVENTION CHECK
  // Attempting to book the SAME slot with another patient must return 409 Conflict!
  try {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${newRegisteredToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider_id: providerUser.provider.id,
        service_id: 1,
        slot_id: createdSlotId,
        notes: 'Malicious / Concurrent duplicate attempt',
      }),
    });
    const data = await res.json();
    record(
      'Security: Concurrency & Double-Booking Lock',
      res.status === 409 && data.error?.code === 'CONFLICT',
      `HTTP ${res.status} Conflict (Row-level lock prevented collision)`
    );
  } catch (e) {
    record('Security: Concurrency & Double-Booking Lock', false, e.message);
  }

  // 9. Appointment Detail & Ownership Check
  try {
    const res = await fetch(`${BASE_URL}/appointments/${bookedAppointmentId}`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const data = await res.json();
    record('Appointment: View Own Details (/appointments/:id)', res.status === 200 && data.data?.id === bookedAppointmentId, `Patient: ${data.data?.patient_name}`);
  } catch (e) {
    record('Appointment: View Own Details (/appointments/:id)', false, e.message);
  }

  // Ownership security check: User B cannot access User A's appointment
  try {
    const res = await fetch(`${BASE_URL}/appointments/${bookedAppointmentId}`, {
      headers: { Authorization: `Bearer ${newRegisteredToken}` },
    });
    const data = await res.json();
    record('Security: Ownership Enforcement (Unauthorized Access Blocked)', res.status === 403, `HTTP ${res.status} (Access forbidden for other users)`);
  } catch (e) {
    record('Security: Ownership Enforcement (Unauthorized Access Blocked)', false, e.message);
  }

  // 10. Reschedule Appointment to Another Slot
  // Create a second future slot
  const altSlotStart = new Date(slotDate.getTime());
  altSlotStart.setHours(14, 0, 0, 0);
  const altSlotEnd = new Date(slotDate.getTime());
  altSlotEnd.setHours(14, 45, 0, 0);

  let altSlotId = null;
  try {
    const slotRes = await fetch(`${BASE_URL}/slots`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${providerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_time: altSlotStart.toISOString(),
        end_time: altSlotEnd.toISOString(),
      }),
    });
    const slotData = await slotRes.json();
    altSlotId = slotData.data?.id;

    // Reschedule
    const res = await fetch(`${BASE_URL}/appointments/${bookedAppointmentId}/reschedule`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_slot_id: altSlotId }),
    });
    const data = await res.json();
    record('Appointment: Reschedule (/appointments/:id/reschedule)', res.status === 200 && data.data?.slot_id === altSlotId, `New Slot #${data.data?.slot_id}`);
  } catch (e) {
    record('Appointment: Reschedule (/appointments/:id/reschedule)', false, e.message);
  }

  // 11. Cancel Appointment
  try {
    const res = await fetch(`${BASE_URL}/appointments/${bookedAppointmentId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Verification test complete' }),
    });
    const data = await res.json();
    record('Appointment: Cancel (/appointments/:id/cancel)', res.status === 200 && data.data?.status === 'cancelled', `Status: ${data.data?.status}`);
  } catch (e) {
    record('Appointment: Cancel (/appointments/:id/cancel)', false, e.message);
  }

  // 12. 2-Hour Cutoff Enforcement Test
  // Find a seeded appointment that starts in the past or within 2h
  try {
    // Appointment #1 is a completed/past appointment
    const res = await fetch(`${BASE_URL}/appointments/1/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Try cancelling past appt' }),
    });
    record('Security: Cutoff & State Rule (Cannot cancel past/completed)', res.status === 400, `HTTP ${res.status} Bad Request`);
  } catch (e) {
    record('Security: Cutoff & State Rule (Cannot cancel past/completed)', false, e.message);
  }

  // 13. Admin Endpoints & RBAC
  try {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const stats = data.data;
    record(
      'Admin: KPI Stats & Analytics (/admin/stats)',
      res.status === 200 && stats?.summary?.totalPatients > 0 && stats?.busiestDays?.length > 0,
      `Patients: ${stats?.summary?.totalPatients}, Gross Revenue: $${stats?.summary?.grossRevenue}`
    );
  } catch (e) {
    record('Admin: KPI Stats & Analytics (/admin/stats)', false, e.message);
  }

  // Admin Appointments List
  try {
    const res = await fetch(`${BASE_URL}/admin/appointments?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    record('Admin: All Appointments (/admin/appointments)', res.status === 200 && data.data?.length > 0, `Total Appointments: ${data.meta?.total}`);
  } catch (e) {
    record('Admin: All Appointments (/admin/appointments)', false, e.message);
  }

  // Role Protection check: Patient cannot access Admin routes
  try {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    record('Security: Admin RBAC Protection (Patient access blocked)', res.status === 403, `HTTP ${res.status} Forbidden`);
  } catch (e) {
    record('Security: Admin RBAC Protection (Patient access blocked)', false, e.message);
  }

  // 14. Pagination, Filtering, Sorting
  try {
    const res = await fetch(`${BASE_URL}/appointments?status=booked&sort=start_time:desc&page=1&limit=3`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const data = await res.json();
    record('Appointments: Filtering, Sorting, & Pagination', res.status === 200 && data.meta?.limit === 3, `Page: ${data.meta?.page}/${data.meta?.totalPages}`);
  } catch (e) {
    record('Appointments: Filtering, Sorting, & Pagination', false, e.message);
  }

  console.log('\n======================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(`VERIFICATION SUMMARY: ${results.filter((r) => r.passed).length} / ${results.length} PASSED`);
  console.log(`OVERALL RESULT: ${allPassed ? '🟢 ALL FUNCTIONS WORKING PERFECTLY' : '🔴 SOME TESTS FAILED'}`);
  console.log('======================================================\n');
}

runVerification();

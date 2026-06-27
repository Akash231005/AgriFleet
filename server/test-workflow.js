const API_URL = 'http://localhost:5000/api/driver';
let token = '';
let bookingId = '';

async function runTest() {
  try {
    console.log('--- Starting Workflow Validation ---');

    // 1. Login
    console.log('\n1. Logging in as driver...');
    let res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ramesh@agrifleet.com',
        password: 'Password123'
      })
    });
    if (!res.ok) {
        let text = await res.text();
        throw new Error(`Login failed: ${res.statusText} - ${text}`);
    }
    let data = await res.json();
    token = data.data.token;
    console.log('Login successful. Token received.');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Get Jobs
    console.log('\n2. Fetching assigned jobs...');
    res = await fetch(`${API_URL}/dashboard/my-jobs`, { headers });
    if (!res.ok) {
        let text = await res.text();
        throw new Error(`Get jobs failed: ${res.statusText} - ${text}`);
    }
    data = await res.json();
    const jobs = data.data;
    console.log(`Found ${jobs.length} jobs.`);
    if (jobs.length === 0) throw new Error('No jobs found!');

    bookingId = jobs[0]._id;
    console.log(`Selected job: ${jobs[0].bookingRef} (${bookingId})`);

    // 3. Accept Job
    console.log('\n3. Accepting job...');
    res = await fetch(`${API_URL}/dashboard/jobs/${bookingId}/accept`, { method: 'PATCH', headers });
    if (!res.ok) {
        let text = await res.text();
        throw new Error(`Accept failed: ${res.statusText} - ${text}`);
    }
    data = await res.json();
    console.log('Accept result:', data.message);

    // 4. Start Job
    console.log('\n4. Starting job...');
    res = await fetch(`${API_URL}/dashboard/jobs/${bookingId}/start`, { method: 'PATCH', headers });
    if (!res.ok) {
        let text = await res.text();
        throw new Error(`Start failed: ${res.statusText} - ${text}`);
    }
    data = await res.json();
    console.log('Start result:', data.message);

    // 5. Complete Job
    console.log('\n5. Completing job...');
    res = await fetch(`${API_URL}/dashboard/jobs/${bookingId}/complete`, { method: 'PATCH', headers });
    if (!res.ok) {
        let text = await res.text();
        throw new Error(`Complete failed: ${res.statusText} - ${text}`);
    }
    data = await res.json();
    console.log('Complete result:', data.message);

    console.log('\n--- Workflow Validation Successful! ---');
  } catch (error) {
    console.error('\nWorkflow Validation Failed:', error.message);
    process.exit(1);
  }
}

runTest();

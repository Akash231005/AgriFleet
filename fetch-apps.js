async function run() {
    const adminRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin_demo@agrifleet.com', password: 'Password123!' })
    });
    const adData = await adminRes.json();
    const token = adData.data.token;

    const appsRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/drivers/admin/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await appsRes.text();
    console.log('App Data:', data.slice(0, 1000));
}
run();

async function run() {
    try {
        const adminRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin_demo@agrifleet.com', password: 'Password123!' })
        });
        const adData = await adminRes.json();
        const token = adData.data.token;

        const appsRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/drivers/admin/applications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const { data: apps } = await appsRes.json();
        const targetApp = apps[0];

        console.log('Approving Application ID:', targetApp._id);
        const approveRes = await fetch(`https://agrifleet-backend.onrender.com/api/v1/drivers/admin/applications/${targetApp._id}/approve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ comments: 'Auto APPROVED.' })
        });
        console.log('Approval Context:', approveRes.status, await approveRes.text());
    } catch (e) { console.error(e); }
}
run();

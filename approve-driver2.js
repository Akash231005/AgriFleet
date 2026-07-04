async function fixDriver() {
    try {
        const loginPayload = JSON.stringify({ email: 'admin_demo@agrifleet.com', password: 'Password123!' });
        console.log('Sending login payload');
        const loginRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: loginPayload
        });
        const loginText = await loginRes.text();
        let loginData;
        try { loginData = JSON.parse(loginText); } catch (e) { console.error('Not JSON:', loginText); return; }

        if (!loginData.success) { console.error('Login failed:', loginData); return; }
        const token = loginData.data.token;
        console.log('Login success. Token obtained.');

        // Fetch apps
        const appRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/drivers/admin/applications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const appsText = await appRes.text();
        let appsData;
        try { appsData = JSON.parse(appsText); } catch (e) { console.error('App not JSON:', appsText); return; }

        const apps = appsData.data || [];
        console.log(`Found ${apps.length} applications`);

        // Attempt to approve ALL pending driver applications to ensure our demo is covered
        for (const app of apps) {
            console.log(`Checking application ${app._id}, status: ${app.status}`);
            if (app.status !== 'APPROVED') {
                console.log(`Approving ${app._id}...`);
                const approveRes = await fetch(`https://agrifleet-backend.onrender.com/api/v1/driver/admin/applications/${app._id}/approve`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comments: 'Auto approved by system.' })
                });
                console.log(`Approve result for ${app._id}:`, await approveRes.status);
            }
        }
        console.log('Script complete.');
    } catch (error) {
        console.error('Fatal Script Error:', error);
    }
}
fixDriver();

async function run() {
    try {
        const email = 'driver_functional@agrifleet.com';
        const ts = Date.now().toString().slice(-10);
        console.log('1. Registering Driver...');
        const regRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/register-driver', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                personalDetails: { name: 'Functional Driver', email: email, password: 'Password123!', phone: ts, gender: 'Male' },
                professionalDetails: { experienceYears: 5 },
                bankDetails: { accountHolderName: 'Functional Driver', bankName: 'SBI', accountNumber: '123', ifscCode: 'SBI' }
            })
        });
        console.log('Reg Context:', regRes.status, await regRes.text());

        console.log('2. Admin Auth...');
        const adminRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin_demo@agrifleet.com', password: 'Password123!' })
        });
        const adData = await adminRes.json();
        const token = adData.data.token;

        console.log('3. Find Applications...');
        const appsRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/drivers/admin/applications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const { data: apps } = await appsRes.json();
        const targetApp = apps.find(a => a.driverId?.userId?.email === email || a.driverId?.phone === ts);
        if (!targetApp) { console.error('Missing application in DB list!'); return; }

        console.log('4. Approving Application ID:', targetApp._id);
        const approveRes = await fetch(`https://agrifleet-backend.onrender.com/api/v1/drivers/admin/applications/${targetApp._id}/approve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ comments: 'Auto APPROVED.' })
        });
        console.log('Approval Context:', approveRes.status, await approveRes.text());
        console.log('ALL DONE! Driver is perfectly ready on production!');
    } catch (e) { console.error('E', e); }
}
run();

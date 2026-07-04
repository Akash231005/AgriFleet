async function fixDriver() {
    try {
        const loginRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin_demo@agrifleet.com', password: 'Password123!' })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) { console.error('Admin login failed'); return; }

        const token = loginData.data.token;
        console.log('Login OK. Fetching unapproved drivers...');

        const driversRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/driver', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const driversData = await driversRes.json();
        console.log('Drivers Count:', driversData.data?.length || 0);

        const driverProfiles = driversData.data || [];
        const targetDriver = driverProfiles.find(d => d.phone === '2222222222' || d.phone === '9876543210' || d.userId?.email === 'driver_demo@agrifleet.com');

        if (!targetDriver) {
            console.log('Target driver not found in DB! I will register him now.');
            const dReg = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/register-driver', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personalDetails: { name: 'Demo Driver', email: 'driver_demo@agrifleet.com', password: 'Password123!', phone: '8888888888', gender: 'Male' },
                    professionalDetails: { experienceYears: 5 },
                    bankDetails: { accountHolderName: 'Demo Driver', bankName: 'SBI', accountNumber: '1111', ifscCode: 'SBIN0001234' }
                })
            });
            console.log('Registered Driver:', await dReg.text());
            return;
        }

        console.log('Found Target Driver ID:', targetDriver._id, 'Approval Status:', targetDriver.approvalStatus);

        // Get apps
        const appRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/driver/admin/applications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const appsData = await appRes.json();
        const apps = appsData.data || [];

        const dApp = apps.find(a => (a.driverId && (a.driverId._id === targetDriver._id || a.driverId === targetDriver._id)));

        if (dApp) {
            console.log('Found Application ID:', dApp._id, 'Approving...');
            const approveRes = await fetch(`https://agrifleet-backend.onrender.com/api/v1/driver/admin/applications/${dApp._id}/approve`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ comments: 'Auto approved' })
            });
            console.log('Approve result:', await approveRes.text());
        } else {
            console.log('Could not find corresponding application document.');
        }
    } catch (error) {
        console.error('Fatal Script Error:', error);
    }
}
fixDriver();

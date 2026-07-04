async function createDemos() {
    // 1. Create Farmer
    try {
        console.log('Sending Farmer Request...');
        const farmerRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Demo Farmer',
                email: 'farmer_demo@agrifleet.com',
                password: 'Password123!',
                phone: '1111111111',
                totalAcres: 50,
                landType: 'irrigated'
            })
        });
        console.log('Farmer Create Status:', farmerRes.status);
        console.log('Farmer Response:', await farmerRes.text());
    } catch (e) { console.error('Farmer error', e); }

    // 2. Create Driver
    try {
        console.log('Sending Driver Request...');
        const driverRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/register-driver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                personalDetails: {
                    name: 'Demo Driver',
                    email: 'driver_demo@agrifleet.com',
                    password: 'Password123!',
                    phone: '2222222222',
                    gender: 'Male'
                },
                professionalDetails: {
                    experienceYears: 5
                },
                bankDetails: {
                    accountHolderName: 'Demo Driver',
                    bankName: 'SBI',
                    accountNumber: '111122223333',
                    ifscCode: 'SBIN0001234'
                }
            })
        });
        console.log('Driver Create Status:', driverRes.status);
        console.log('Driver Response:', await driverRes.text());
    } catch (e) { console.error('Driver error', e); }
}

createDemos();

async function newDriverBuild() {
    try {
        const ts = Date.now().toString().slice(-10);
        const email = `driver_pro_demo_${ts}@agrifleet.com`;
        console.log(`Registering brand new target driver: ${email}`);

        const driverRes = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/register-driver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                personalDetails: { name: 'Demo Driver Pro', email: email, password: 'Password123!', phone: ts, gender: 'Male' },
                professionalDetails: { experienceYears: 5 },
                bankDetails: { accountHolderName: 'Demo Driver Pro', bankName: 'SBI', accountNumber: 'x', ifscCode: 'x' }
            })
        });
        console.log('Driver Create Response:', driverRes.status, await driverRes.text());
    } catch (e) { console.error('E', e); }
}
newDriverBuild();



async function testAuth() {
    try {
        const res = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@agrifleet.com', password: 'Password123' })
        });
        const data = await res.json();
        console.log('Admin Auth Response:', res.status, data);
    } catch (err) {
        console.error('Admin Auth Error:', err);
    }

    try {
        const res = await fetch('https://agrifleet-backend.onrender.com/api/v1/driver/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: '9876543210', password: 'Password123' })
        });
        const data = await res.json();
        console.log('Driver Auth Response:', res.status, data);
    } catch (err) {
        console.error('Driver Auth Error:', err);
    }
}

testAuth();

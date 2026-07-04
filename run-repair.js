async function runRepair() {
    try {
        console.log('Hitting repair endpoint on production...');
        const res = await fetch('https://agrifleet-backend.onrender.com/api/v1/auth/repair-demo', { method: 'POST' });
        console.log('Repair Data:', await res.text());
    } catch (err) {
        console.error('Error:', err);
    }
}
runRepair();

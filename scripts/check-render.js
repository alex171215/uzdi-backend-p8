async function check() {
  try {
    const r = await fetch('https://uzdi-backend-api.onrender.com/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'admin', password: 'Admin.Uzdi2026' })
    });
    const d = await r.json();
    const token = d.data ? d.data.token : null;
    if (!token) {
      console.log('No token in response:', d);
      return;
    }
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
    console.log('Current Live JWT Payload:', payload);

    if (payload.rol_codigo === 'ADM') {
      console.log('\n--- TESTING GET /api/v1/provincia ---');
      const provRes = await fetch('https://uzdi-backend-api.onrender.com/api/v1/provincia', {
        headers: { Authorization: 'Bearer ' + token }
      });
      console.log('Provincia status:', provRes.status);
      const provData = await provRes.json();
      console.log('Provincias count:', provData.data ? provData.data.length : provData.length);

      console.log('\n--- TESTING GET /api/v1/adolescente ---');
      const adlcRes = await fetch('https://uzdi-backend-api.onrender.com/api/v1/adolescente', {
        headers: { Authorization: 'Bearer ' + token }
      });
      console.log('Adolescente status:', adlcRes.status);
      const adlcData = await adlcRes.json();
      console.log('Adolescente response ok:', adlcData.ok);
    } else {
      console.log('Render is still serving the old deployment (CONS instead of ADM). Waiting for deploy to finish...');
    }
  } catch (err) {
    console.error('Check error:', err);
  }
}

check();


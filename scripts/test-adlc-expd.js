async function testEndpoints() {
  const loginRes = await fetch('https://uzdi-backend-api.onrender.com/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'admin', password: 'Admin.Uzdi2026' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  console.log('Login OK. Token obtained.');

  const adlcRes = await fetch('https://uzdi-backend-api.onrender.com/api/v1/adolescente', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const adlcData = await adlcRes.json();
  console.log('GET /api/v1/adolescente response:', JSON.stringify(adlcData));

  const expdRes = await fetch('https://uzdi-backend-api.onrender.com/api/v1/expediente', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const expdData = await expdRes.json();
  console.log('GET /api/v1/expediente response:', JSON.stringify(expdData));
}

testEndpoints().catch(console.error);


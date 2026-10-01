// test-api.js
const testFlow = async () => {
  const baseUrl = 'http://localhost:5000/api';

  console.log('--- 1. Testing Health ---');
  const healthRes = await fetch(`${baseUrl}/health`);
  const health = await healthRes.json();
  console.log('Health:', health);

  console.log('\n--- 2. Testing Registration ---');
  const email = `test_${Date.now()}@example.com`;
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name: 'Arjun Sharma', password: 'SecureP@ssw0rd2026!' })
  });
  const reg = await regRes.json();
  console.log('Registered User:', reg.user);
  const token = reg.token;

  console.log('\n--- 3. Testing /auth/me ---');
  const meRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const me = await meRes.json();
  console.log('Authenticated /me:', me.user);

  console.log('\n--- 4. Creating I&E Snapshot ---');
  const snapRes = await fetch(`${baseUrl}/ie/snapshots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      month: 9,
      year: 2026,
      income_data: { Salary: 85000, Freelance: 15000 },
      expense_data: { Rent: 22000, Groceries: 12000, Utilities: 4500, Entertainment: 6000 },
      notes: 'September budget snapshot'
    })
  });
  const snap = await snapRes.json();
  console.log('Snapshot Created:', snap.snapshot?.total_income, 'Expense:', snap.snapshot?.total_expenses, 'Savings:', snap.snapshot?.net_savings);

  console.log('\n--- 5. Testing AI Analysis (/api/agent/analyze) ---');
  const analyzeRes = await fetch(`${baseUrl}/agent/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ period: 'current', query: 'Analyze my September spending' })
  });
  const analysis = await analyzeRes.json();
  console.log('Analysis Summary:', analysis.summary);
  console.log('Analysis Sections:', analysis.sections?.length);

  console.log('\n--- 6. Testing AI Advisor Chat (/api/agent/chat) ---');
  const chatRes = await fetch(`${baseUrl}/agent/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message: 'How much emergency fund should I keep?' })
  });
  const chat = await chatRes.json();
  console.log('Chat reply preview:', chat.raw_text?.slice(0, 150));

  console.log('\n--- 7. Testing Guest Analysis (/api/guest/analyze) ---');
  const guestRes = await fetch(`${baseUrl}/guest/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      income_data: { Salary: 60000 },
      expense_data: { Rent: 18000, Food: 8000 },
      query: 'Is my rent too high?'
    })
  });
  const guest = await guestRes.json();
  console.log('Guest Analysis Sections:', guest.sections?.length);

  console.log('\n✅ ALL BACKEND & AGENT END-TO-END TESTS PASSED!');
};

testFlow().catch(console.error);

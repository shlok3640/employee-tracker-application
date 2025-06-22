const readline = require('readline');
const fetch = require('node-fetch'); // If using Node 18+, you can remove this and use global fetch

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

(async () => {
  const baseUrl = 'http://localhost:5000'; // Change if your backend runs elsewhere

  const email = await ask('Admin email: ');
  const password = await ask('Admin password: ');

  // 1. Login as admin
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    console.error('Login failed:', loginData.message || loginData);
    rl.close();
    process.exit(1);
  }

  const token = loginData.token;
  console.log('\nYour JWT token (copy this for the screenshots admin page):\n');
  console.log(token, '\n');

  // 2. Fetch all users
  const usersRes = await fetch(`${baseUrl}/auth/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const users = await usersRes.json();

  if (!usersRes.ok) {
    console.error('Failed to fetch users:', users.message || users);
    rl.close();
    process.exit(1);
  }

  console.log('Users:\n');
  users.forEach(user => {
    console.log(`Name: ${user.name}\nEmail: ${user.email}\nUser ID: ${user._id}\n---`);
  });

  rl.close();
})();
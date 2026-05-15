document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('login-overlay');
  const passInput = document.getElementById('admin-pass');
  const loginBtn = document.getElementById('login-btn');
  const list = document.getElementById('signup-list');
  const totalEl = document.getElementById('signup-total');

  let adminPassword = '';

  loginBtn.addEventListener('click', async () => {
    adminPassword = passInput.value.trim();
    if (!adminPassword) return;

    try {
      const response = await fetch('http://localhost:8000/api/admin/signups', {
        headers: {
          'x-admin-password': adminPassword
        }
      });

      if (response.ok) {
        const signups = await response.json();
        overlay.style.display = 'none';
        renderSignups(signups);
      } else {
        alert('Invalid password');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Could not connect to backend');
    }
  });

  function renderSignups(signups) {
    totalEl.textContent = signups.length;
    list.innerHTML = signups.map(s => `
      <tr>
        <td>#${s.id}</td>
        <td>${s.value}</td>
        <td>${new Date(s.timestamp).toLocaleString()}</td>
      </tr>
    `).join('');
  }
});

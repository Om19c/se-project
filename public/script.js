const API_URL = '';

const doctors = [
  { id: 'Dr. Sarah Jenkins', name: 'Dr. Sarah Jenkins', spec: 'Cardiologist', rating: '4.9', exp: '15 Yrs', patients: '3.2K+', bio: 'Dr. Sarah Jenkins is a board-certified cardiologist with over 15 years of experience in diagnosing and treating cardiovascular diseases.', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
  { id: 'Dr. Michael Chen', name: 'Dr. Michael Chen', spec: 'Neurologist', rating: '4.8', exp: '12 Yrs', patients: '2.1K+', bio: 'Dr. Michael Chen specializes in treating disorders of the nervous system, bringing cutting-edge neurological care to his patients.', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
  { id: 'Dr. Emily Richards', name: 'Dr. Emily Richards', spec: 'Pediatrician', rating: '5.0', exp: '10 Yrs', patients: '4.5K+', bio: 'Dr. Emily Richards provides compassionate and comprehensive care for infants, children, and adolescents, focusing on preventative wellness.', img: 'https://images.unsplash.com/photo-1527613426401-41c9b0edce48?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
  { id: 'Dr. David Martinez', name: 'Dr. David Martinez', spec: 'Orthopedics', rating: '4.7', exp: '14 Yrs', patients: '2.8K+', bio: 'Dr. David Martinez is a leading orthopedic surgeon with extensive experience in sports injuries, joint replacements, and bone health.', img: 'https://images.unsplash.com/photo-1594824436998-d50d6ff71228?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
  { id: 'Dr. James Wilson', name: 'Dr. James Wilson', spec: 'General Surgery', rating: '4.9', exp: '20 Yrs', patients: '5K+', bio: 'Dr. James Wilson is a highly skilled general surgeon focused on minimally invasive surgical techniques and post-operative care.', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
  { id: 'Dr. Olivia Taylor', name: 'Dr. Olivia Taylor', spec: 'Dermatologist', rating: '4.8', exp: '8 Yrs', patients: '1.9K+', bio: 'Dr. Olivia Taylor treats a wide array of skin, hair, and nail conditions, combining medical dermatology with aesthetic procedures.', img: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }
];

let currentModalDoctorId = null;

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isAuthPage = path.includes('login') || path.includes('signup') || path.includes('forgot-password') || path.includes('reset-password');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'user';

  if (!isAuthPage) {
    if (!token) {
      window.location.href = 'login.html';
    } else {
      setupUIForRole(role);
    }
  } else {
    if (token) {
      window.location.href = 'index.html';
    }
  }

  ['signupForm', 'loginForm', 'bookForm', 'forgotPasswordForm', 'resetPasswordForm'].forEach(id => {
    const form = document.getElementById(id);
    if (form) {
      if(id === 'signupForm') form.addEventListener('submit', handleSignup);
      if(id === 'loginForm') form.addEventListener('submit', handleLogin);
      if(id === 'bookForm') form.addEventListener('submit', handleBooking);
      if(id === 'forgotPasswordForm') form.addEventListener('submit', handleForgotPassword);
      if(id === 'resetPasswordForm') form.addEventListener('submit', handleResetPassword);
    }
  });
});

function setupUIForRole(role) {
  if (role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('d-none'));
    document.querySelectorAll('.user-only').forEach(el => el.classList.add('d-none'));
    showSection('admin');
    fetchAdminAppointments();
  } else {
    document.querySelectorAll('.user-only').forEach(el => el.classList.remove('d-none'));
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('d-none'));
    showSection('home');
    renderDoctorsList();
  }
}

function showAlert(message, type = 'success') {
  const container = document.getElementById('alertContainer');
  if (container) {
    container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
    setTimeout(() => { container.innerHTML = ''; }, 3000);
  } else alert(message);
}

// User Functions
function renderDoctorsList() {
  const container = document.getElementById('doctorListContainer');
  if(!container) return;
  container.innerHTML = '';
  doctors.forEach(doc => {
    container.innerHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="doctor-card text-center p-4 d-flex flex-column h-100" onclick="openDoctorModal('${doc.id}')">
          <img src="${doc.img}" class="doctor-img-top mb-3" alt="Doctor">
          <h5 class="fw-bold mb-1 text-dark">${doc.name}</h5>
          <p class="text-primary fw-medium small mb-2">${doc.spec}</p>
          <div class="mt-auto pt-2">
            <div class="d-flex justify-content-center align-items-center gap-2 small text-muted">
              <span class="text-warning fw-bold">★ ${doc.rating}</span><span>•</span><span>${doc.patients} Patients</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

function openDoctorModal(docId) {
  const doc = doctors.find(d => d.id === docId);
  if(!doc) return;
  currentModalDoctorId = doc.id;
  document.getElementById('modalDocImg').src = doc.img;
  document.getElementById('modalDocName').textContent = doc.name;
  document.getElementById('modalDocSpec').textContent = doc.spec;
  document.getElementById('modalDocRating').textContent = '★ ' + doc.rating;
  document.getElementById('modalDocExp').textContent = doc.exp;
  document.getElementById('modalDocPatients').textContent = doc.patients;
  document.getElementById('modalDocBio').textContent = doc.bio;
  const modal = new bootstrap.Modal(document.getElementById('doctorModal'));
  modal.show();
}

function bookFromModal() {
  const modalObj = bootstrap.Modal.getInstance(document.getElementById('doctorModal'));
  if(modalObj) modalObj.hide();
  showSection('book');
  const selectElem = document.getElementById('doctor');
  if(selectElem && currentModalDoctorId) selectElem.value = currentModalDoctorId;
}

function showSection(section) {
  ['home', 'book', 'view', 'admin'].forEach(s => {
    const el = document.getElementById(s + 'Section');
    const nav = document.getElementById('nav-' + s);
    if(el) el.style.display = (s === section) ? 'block' : 'none';
    if(nav) nav.classList.toggle('active', s === section);
  });
}

// Auth Handlers
async function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch(`${API_URL}/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (res.ok) {
      showAlert('Signed up successfully! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } else showAlert(data.message || 'Signup failed', 'danger');
  } catch (err) { showAlert('Server error occurred', 'danger'); }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role); // Save role
      showAlert('Logged in successfully!', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } else showAlert(data.message || 'Login failed', 'danger');
  } catch (err) { showAlert('Server error occurred', 'danger'); }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = 'login.html';
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  try {
    const res = await fetch(`${API_URL}/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data = await res.json();
    if (res.ok) {
      // In a real application, an email would be sent here.
      // For demo purposes, we redirect manually with token.
      showAlert(`Token generated: ${data.token}. Redirecting to reset page...`, 'success');
      setTimeout(() => { window.location.href = `reset-password.html?token=${data.token}`; }, 3000);
    } else showAlert(data.message || 'Error processing request', 'danger');
  } catch (err) { showAlert('Server error occurred', 'danger'); }
}

async function handleResetPassword(e) {
  e.preventDefault();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    return showAlert('Passwords do not match.', 'danger');
  }

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (!token) return showAlert('No reset token provided.', 'danger');

  try {
    const res = await fetch(`${API_URL}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword }) });
    const data = await res.json();
    if (res.ok) {
      showAlert('Password reset successfully! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 2000);
    } else showAlert(data.message || 'Error resetting password', 'danger');
  } catch (err) { showAlert('Server error occurred', 'danger'); }
}

// Appointment Posting (User)
async function handleBooking(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) return logout();
  const payload = {
    patientName: document.getElementById('patientName').value,
    age: document.getElementById('age').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    doctor: document.getElementById('doctor').value
  };
  try {
    const res = await fetch(`${API_URL}/appointments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload)
    });
    if (res.ok) {
      showAlert('Appointment booked successfully!', 'success');
      document.getElementById('bookForm').reset();
      setTimeout(() => { showSection('view'); fetchAppointments(); }, 1500);
    } else showAlert((await res.json()).message || 'Booking failed', 'danger');
  } catch (err) { showAlert('Server error occurred', 'danger'); }
}

// Fetch Appointments (User)
async function fetchAppointments() {
  const token = localStorage.getItem('token');
  if (!token) return logout();
  try {
    const res = await fetch(`${API_URL}/appointments`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) renderAppointments(data);
    else showAlert(data.message || 'Failed to load appointments', 'danger');
  } catch (err) { showAlert('Server error occurred', 'danger'); }
}

function getStatusBadgeClass(status) {
  if (status === 'Accepted') return 'bg-success';
  if (status === 'Declined') return 'bg-danger';
  return 'bg-warning text-dark';
}

function renderAppointments(appointments) {
  const list = document.getElementById('appointmentsList');
  if(!list) return;
  list.innerHTML = '';
  if (appointments.length === 0) { list.innerHTML = '<div class="col-12 text-center text-muted mt-5"><p>No appointments found.</p></div>'; return; }

  appointments.forEach(app => {
    const statusClass = getStatusBadgeClass(app.status);
    list.innerHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="appt-card h-100 fade-in position-relative">
          <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h5 class="fw-bold text-dark mb-0">${app.patientName}</h5>
            <span class="badge ${statusClass} rounded-pill px-3">${app.status || 'Pending'}</span>
          </div>
          <p class="mb-2 text-muted small"><strong class="text-dark">Assigned Doctor:</strong> ${app.doctor}</p>
          <div class="d-flex gap-3 text-muted small">
            <div class="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded">📅 ${app.date}</div>
            <div class="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded">⏰ ${app.time}</div>
          </div>
        </div>
      </div>
    `;
  });
}

// Admin Functions
async function fetchAdminAppointments() {
  const token = localStorage.getItem('token');
  if (!token) return logout();
  try {
    const res = await fetch(`${API_URL}/admin/appointments`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) renderAdminAppointments(data);
    else showAlert(data.message || 'Failed to load admin appointments', 'danger');
  } catch (err) { showAlert('Server error occurred', 'danger'); }
}

function renderAdminAppointments(appointments) {
  const list = document.getElementById('adminAppointmentsList');
  if(!list) return;
  list.innerHTML = '';
  if (appointments.length === 0) { list.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">No appointments found.</td></tr>'; return; }

  appointments.forEach(app => {
    const statusClass = getStatusBadgeClass(app.status);
    const btns = app.status === 'Pending' ? `
      <button class="btn btn-sm btn-success px-3 rounded-pill" onclick="updateAppointmentStatus('${app._id}', 'Accepted')">Accept</button>
      <button class="btn btn-sm btn-danger px-3 rounded-pill ms-1" onclick="updateAppointmentStatus('${app._id}', 'Declined')">Decline</button>
    ` : `<span class="text-muted small fw-bold">Resolved</span>`;

    list.innerHTML += `
      <tr class="fade-in">
        <td class="px-4 py-3">
          <p class="fw-bold mb-0 text-dark">${app.patientName}</p>
          <small class="text-muted">Age: ${app.age} | User: ${app.userId?.email || 'N/A'}</small>
        </td>
        <td class="px-4 py-3"><span class="fw-medium text-dark">${app.doctor}</span></td>
        <td class="px-4 py-3">
          <div class="small"><span class="fw-bold text-dark">${app.date}</span></div>
          <div class="small text-muted">${app.time}</div>
        </td>
        <td class="px-4 py-3"><span class="badge ${statusClass}">${app.status || 'Pending'}</span></td>
        <td class="px-4 py-3 text-end">${btns}</td>
      </tr>
    `;
  });
}

async function updateAppointmentStatus(id, status) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_URL}/admin/appointments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showAlert(`Appointment ${status} successfully`, 'success');
      fetchAdminAppointments(); // Refresh list
    } else {
      showAlert('Failed to update status', 'danger');
    }
  } catch (err) {
    showAlert('Server error occurred', 'danger');
  }
}

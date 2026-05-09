const API = '/api';
const params = new URLSearchParams(window.location.search);
const carId = params.get('car');
let currentCar = null;
let selectedPayment = 'card';
let pickupDate = null, dropoffDate = null;

// ── TOAST ──────────────────────────────────────────────
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3500);
}

// ── PAYMENT SELECTOR ──────────────────────────────────────────────
function selectPayment(method) {
  selectedPayment = method;
  ['card', 'paypal', 'bitcoin'].forEach(m => {
    document.getElementById(`opt-${m}`).classList.toggle('active', m === method);
    document.getElementById(`dot-${m}`).classList.toggle('active', m === method);
  });
  const cardFields = document.getElementById('card-fields');
  if (cardFields) cardFields.style.display = method === 'card' ? 'block' : 'none';
}

// ── CARD FORMATTER ──────────────────────────────────────────────
function formatCard(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}

// ── PROMO ──────────────────────────────────────────────
function applyPromo() {
  const code = document.getElementById('promoCode').value.trim().toUpperCase();
  if (code === 'MORENT10') {
    showToast('10% discount applied!', 'success');
    updateSummary(0.9);
  } else if (code) {
    showToast('Invalid promo code', 'error');
  }
}

// ── SUMMARY ──────────────────────────────────────────────
function updateSummary(discount = 1) {
  if (!currentCar) return;
  const pd = document.getElementById('pickup_date').value;
  const dd = document.getElementById('dropoff_date').value;
  let days = 1;
  if (pd && dd) {
    const diff = (new Date(dd) - new Date(pd)) / 86400000;
    if (diff > 0) days = diff;
  }
  const subtotal = parseFloat(currentCar.price_per_day) * days * discount;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
}

// ── LOAD CAR ──────────────────────────────────────────────
async function loadCar() {
  if (!carId) { showToast('No car selected', 'error'); return; }
  try {
    const res = await fetch(`${API}/cars/${carId}/`);
    if (!res.ok) throw new Error('Car not found');
    currentCar = await res.json();
    document.getElementById('summaryCarName').textContent = currentCar.name;
    document.getElementById('summaryReviews').textContent = `${currentCar.reviews || 0}+ Reviewer`;
    if (currentCar.image) {
      document.getElementById('summaryImg').innerHTML = `<img src="${currentCar.image}" style="width:64px;height:48px;object-fit:contain" onerror="this.parentElement.textContent='🚗'" />`;
    }
    // Pre-fill from sessionStorage
    const saved = JSON.parse(sessionStorage.getItem('booking') || '{}');
    if (saved.pickup_location) document.getElementById('pickup_location').value = saved.pickup_location;
    if (saved.pickup_date)     document.getElementById('pickup_date').value     = saved.pickup_date;
    if (saved.pickup_time)     document.getElementById('pickup_time').value     = saved.pickup_time;
    if (saved.dropoff_location)document.getElementById('dropoff_location').value= saved.dropoff_location;
    if (saved.dropoff_date)    document.getElementById('dropoff_date').value    = saved.dropoff_date;
    if (saved.dropoff_time)    document.getElementById('dropoff_time').value    = saved.dropoff_time;
    updateSummary();
  } catch (err) {
    showToast('Failed to load car details', 'error');
    console.error(err);
  }
}

// ── DATE CHANGE ──────────────────────────────────────────────
document.getElementById('pickup_date').addEventListener('change', () => updateSummary());
document.getElementById('dropoff_date').addEventListener('change', () => updateSummary());

// ── VALIDATE ──────────────────────────────────────────────
function validateForm() {
  const required = [
    ['full_name',        'Full name'],
    ['phone',            'Phone number'],
    ['address',          'Address'],
    ['city',             'City'],
    ['pickup_location',  'Pickup location'],
    ['pickup_date',      'Pickup date'],
    ['pickup_time',      'Pickup time'],
    ['dropoff_location', 'Drop-off location'],
    ['dropoff_date',     'Drop-off date'],
    ['dropoff_time',     'Drop-off time'],
  ];
  for (const [id, label] of required) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      showToast(`Please fill in: ${label}`, 'error');
      el && el.focus();
      return false;
    }
  }
  const pd = new Date(document.getElementById('pickup_date').value);
  const dd = new Date(document.getElementById('dropoff_date').value);
  if (dd <= pd) { showToast('Drop-off date must be after pickup date', 'error'); return false; }
  if (!document.getElementById('agree_terms').checked) {
    showToast('Please agree to the terms and conditions', 'error');
    return false;
  }
  return true;
}

// ── SUBMIT ──────────────────────────────────────────────
async function submitRental() {
  if (!validateForm()) return;

  const payload = {
    car:              parseInt(carId),
    full_name:        document.getElementById('full_name').value.trim(),
    phone:            document.getElementById('phone').value.trim(),
    address:          document.getElementById('address').value.trim(),
    city:             document.getElementById('city').value.trim(),
    pickup_location:  document.getElementById('pickup_location').value,
    dropoff_location: document.getElementById('dropoff_location').value,
    pickup_date:      document.getElementById('pickup_date').value,
    dropoff_date:     document.getElementById('dropoff_date').value,
    pickup_time:      document.getElementById('pickup_time').value,
    dropoff_time:     document.getElementById('dropoff_time').value,
    payment_method:   selectedPayment === 'paypal' ? 'paypal' : selectedPayment === 'bitcoin' ? 'bitcoin' : 'card',
  };

  const btn = document.querySelector('.btn-primary[onclick="submitRental()"]');
  btn.textContent = 'Processing...'; btn.disabled = true;

  try {
    const res = await fetch(`${API}/rentals/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      const msg = typeof err === 'object' ? Object.values(err).flat().join(' ') : 'Booking failed';
      throw new Error(msg);
    }

    showToast('🎉 Car booked successfully!', 'success');
    sessionStorage.removeItem('booking');
    setTimeout(() => { window.location.href = '/dashboard/'; }, 1500);
  } catch (err) {
    showToast(err.message || 'Something went wrong', 'error');
    btn.textContent = 'Rent Now'; btn.disabled = false;
    console.error(err);
  }
}

loadCar();
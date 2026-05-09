const API = '/api';

// ── HELPERS ──────────────────────────────────────────────
function carImageHTML(car) {
  if (car.image) {
    return `<div class="car-image-wrap">
      <img class="car-image" src="${car.image}" alt="${car.name}"
        onerror="this.parentElement.innerHTML='<div class=car-image-placeholder>🚗</div>'" />
    </div>`;
  }
  return `<div class="car-image-wrap"><div class="car-image-placeholder">🚗</div></div>`;
}

function heartIcon(liked) {
  return liked
    ? `<svg fill="#ED3F3F" stroke="#ED3F3F" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    : `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

function buildCarCard(car) {
  const liked = getLiked(car.id);
  const oldPrice = car.price_per_day > 80
    ? `<div class="car-old-price">$${(parseFloat(car.price_per_day) * 1.25).toFixed(2)}</div>` : '';
  return `
    <div class="car-card" onclick="goDetail(${car.id})" style="cursor:pointer">
      <div class="car-card-header">
        <div>
          <div class="car-name">${car.name}</div>
          <div class="car-type">${capitalize(car.type)}</div>
        </div>
        <button class="heart-btn ${liked ? 'liked' : ''}" onclick="toggleLike(event, ${car.id}, this)">
          ${heartIcon(liked)}
        </button>
      </div>
      ${carImageHTML(car)}
      <div class="car-specs">
        <div class="spec">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-7"/></svg>
          ${car.fuel_capacity}L
        </div>
        <div class="spec">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
          ${capitalize(car.transmission)}
        </div>
        <div class="spec">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ${car.seats} People
        </div>
      </div>
      <div class="car-footer">
        <div>
          <div class="car-price">$${parseFloat(car.price_per_day).toFixed(2)}<span>/day</span></div>
          ${oldPrice}
        </div>
        <button class="btn btn-primary btn-sm" onclick="rentCar(event, ${car.id}, '${car.name}')">Rent Now</button>
      </div>
    </div>`;
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

// ── LIKED ──────────────────────────────────────────────
function getLiked(id) { return JSON.parse(localStorage.getItem('liked') || '[]').includes(id); }
function toggleLike(e, id, btn) {
  e.stopPropagation();
  let liked = JSON.parse(localStorage.getItem('liked') || '[]');
  if (liked.includes(id)) { liked = liked.filter(x => x !== id); btn.classList.remove('liked'); btn.innerHTML = heartIcon(false); }
  else { liked.push(id); btn.classList.add('liked'); btn.innerHTML = heartIcon(true); }
  localStorage.setItem('liked', JSON.stringify(liked));
}

// ── NAVIGATION ──────────────────────────────────────────
function goDetail(id) { window.location.href = `detail.html?id=${id}`; }
function rentCar(e, id, name) {
  e.stopPropagation();
  const booking = {
    car_id: id,
    car_name: name,
    pickup_location:  document.getElementById('pickup_location')?.value  || '',
    pickup_date:      document.getElementById('pickup_date')?.value       || '',
    pickup_time:      document.getElementById('pickup_time')?.value       || '',
    dropoff_location: document.getElementById('dropoff_location')?.value || '',
    dropoff_date:     document.getElementById('dropoff_date')?.value      || '',
    dropoff_time:     document.getElementById('dropoff_time')?.value      || '',
  };
  sessionStorage.setItem('booking', JSON.stringify(booking));
  window.location.href = `payment.html?car=${id}`;
}

// ── SWAP BOOKING ──────────────────────────────────────────
function swapBooking() {
  const pl = document.getElementById('pickup_location');
  const dl = document.getElementById('dropoff_location');
  if (pl && dl) [pl.value, dl.value] = [dl.value, pl.value];
}

// ── TOAST ──────────────────────────────────────────────
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

// ── FETCH ──────────────────────────────────────────────
async function fetchCars(endpoint, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const res = await fetch(`${API}/${endpoint}/`);
    if (!res.ok) throw new Error('Network error');
    const cars = await res.json();
    if (!Array.isArray(cars) || !cars.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>No cars found</p></div>`;
      return;
    }
    container.innerHTML = cars.map(buildCarCard).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>Failed to load cars. Is the server running?</p></div>`;
    console.error(err);
  }
}

async function fetchTotalCars() {
  try {
    const res = await fetch(`${API}/cars/`);
    const data = await res.json();
    const count = Array.isArray(data) ? data.length : (data.count || 0);
    const el = document.getElementById('totalCars');
    if (el) el.textContent = `${count} Car`;
  } catch {}
}

// ── SEARCH ──────────────────────────────────────────────
// Use event delegation so it works after navbar.js injects the search input
let searchTimer;
document.addEventListener('input', function (e) {
  if (e.target.id !== 'searchInput') return;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    const q = e.target.value.trim();
    if (q.length < 2) { fetchCars('popular-cars', 'popularCars'); return; }
    try {
      const res = await fetch(`${API}/cars/?search=${encodeURIComponent(q)}`);
      const cars = await res.json();
      const container = document.getElementById('popularCars');
      if (!container) return;
      container.innerHTML = Array.isArray(cars) && cars.length
        ? cars.map(buildCarCard).join('')
        : `<div style="grid-column:1/-1;text-align:center;color:#90A3BF;padding:40px">No results</div>`;
    } catch {}
  }, 400);
});

// ── INIT ──────────────────────────────────────────────
fetchCars('popular-cars', 'popularCars');
fetchCars('recommended-cars', 'recommendedCars');
fetchTotalCars();
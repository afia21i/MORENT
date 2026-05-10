const API = '/api';
let allCars = [];
let displayedCount = 9;

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

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

function getLiked(id) { return JSON.parse(localStorage.getItem('liked') || '[]').includes(id); }
function toggleLike(e, id, btn) {
  e.stopPropagation();
  let liked = JSON.parse(localStorage.getItem('liked') || '[]');
  if (liked.includes(id)) { liked = liked.filter(x => x !== id); btn.classList.remove('liked'); btn.innerHTML = heartIcon(false); }
  else { liked.push(id); btn.classList.add('liked'); btn.innerHTML = heartIcon(true); }
  localStorage.setItem('liked', JSON.stringify(liked));
}

function buildCard(car) {
  const liked = getLiked(car.id);
  const oldPrice = car.price_per_day > 80
    ? `<div class="car-old-price">$${(parseFloat(car.price_per_day)*1.25).toFixed(2)}</div>` : '';
  return `
    <div class="car-card" onclick="goDetail(${car.id})" style="cursor:pointer">
      <div class="car-card-header">
        <div>
          <div class="car-name">${car.name}</div>
          <div class="car-type">${capitalize(car.type)}</div>
        </div>
        <button class="heart-btn ${liked?'liked':''}" onclick="toggleLike(event,${car.id},this)">${heartIcon(liked)}</button>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ${car.seats} People
        </div>
      </div>
      <div class="car-footer">
        <div>
          <div class="car-price">$${parseFloat(car.price_per_day).toFixed(2)}<span>/day</span></div>
          ${oldPrice}
        </div>
        <button class="btn btn-primary btn-sm" onclick="rentCar(event,${car.id},'${car.name}')">Rent Now</button>
      </div>
    </div>`;
}

function goDetail(id) { window.location.href = `/detail/?id=${id}`; }

function rentCar(e, id, name) {
  e.stopPropagation();
  const booking = {
    car_id: id, car_name: name,
    pickup_location: document.getElementById('pickup_location').value,
    pickup_date: document.getElementById('pickup_date').value,
    pickup_time: document.getElementById('pickup_time').value,
    dropoff_location: document.getElementById('dropoff_location').value,
    dropoff_date: document.getElementById('dropoff_date').value,
    dropoff_time: document.getElementById('dropoff_time').value,
  };
  sessionStorage.setItem('booking', JSON.stringify(booking));
  window.location.href = `/payment/?car=${id}`;
}

function swapBooking() {
  const pl = document.getElementById('pickup_location');
  const dl = document.getElementById('dropoff_location');
  [pl.value, dl.value] = [dl.value, pl.value];
}

function getSelectedTypes() {
  return [...document.querySelectorAll('input[id^="t-"]:checked')].map(cb => cb.value);
}
function getSelectedSeats() {
  return [...document.querySelectorAll('input[id^="s-"]:checked')].map(cb => parseInt(cb.value));
}

function applyFilters() {
  const types = getSelectedTypes();
  const seats = getSelectedSeats();
  const maxPrice = parseFloat(document.getElementById('priceSlider').value);
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();

  const filtered = allCars.filter(car => {
    const matchType   = !types.length || types.includes(car.type);
    const matchSeats  = !seats.length || seats.includes(car.seats) || (seats.includes(8) && car.seats >= 8);
    const matchPrice  = parseFloat(car.price_per_day) <= maxPrice;
    const matchSearch = !search || car.name.toLowerCase().includes(search) || car.brand.toLowerCase().includes(search);
    return matchType && matchSeats && matchPrice && matchSearch;
  });

  displayedCount = 9;
  renderCars(filtered);
}

function renderCars(cars) {
  const grid = document.getElementById('carsGrid');
  if (!cars.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <h3>No cars found</h3><p>Try adjusting your filters</p></div>`;
    document.getElementById('carCount').textContent = '0 Cars';
    document.getElementById('showMoreBtn').style.display = 'none';
    return;
  }
  const shown = cars.slice(0, displayedCount);
  grid.innerHTML = shown.map(buildCard).join('');
  document.getElementById('carCount').textContent = `${cars.length} Car`;
  document.getElementById('showMoreBtn').style.display = cars.length > displayedCount ? 'inline-flex' : 'none';
  grid._filteredCars = cars;
}

function loadMore() {
  displayedCount += 9;
  renderCars(document.getElementById('carsGrid')._filteredCars || allCars);
}

function updatePrice(input) {
  document.getElementById('priceDisplay').textContent = parseFloat(input.value).toFixed(2);
  applyFilters();
}

let searchTimer;
document.addEventListener('input', function (e) {
  if (e.target.id !== 'searchInput') return;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applyFilters, 300);
});

async function loadCounts() {
  try {
    const res = await fetch(`${API}/car-counts/`);
    if (!res.ok) return;
    const data = await res.json();
    const typeMap = { 'sport':'t-sport', 'suv':'t-suv', 'mpv':'t-mpv', 'sedan':'t-sedan', 'coupe':'t-coupe', 'hatchback':'t-hatchback' };
    for (const [type, id] of Object.entries(typeMap)) {
      const count = data.types[type] || 0;
      const checkbox = document.getElementById(id);
      if (checkbox) {
        const countSpan = checkbox.closest('.filter-item').querySelector('.count');
        if (countSpan) countSpan.textContent = `(${count})`;
      }
    }
    const seatMap = { '2':'s-2', '4':'s-4', '6':'s-6', '8+':'s-8' };
    for (const [seats, id] of Object.entries(seatMap)) {
      const count = data.seats[seats] || 0;
      const checkbox = document.getElementById(id);
      if (checkbox) {
        const countSpan = checkbox.closest('.filter-item').querySelector('.count');
        if (countSpan) countSpan.textContent = `(${count})`;
      }
    }
  } catch (err) {
    console.error('Could not load counts:', err);
  }
}

async function fetchAllCars() {
  try {
    const res = await fetch(`${API}/cars/`);
    if (!res.ok) throw new Error('Server error');
    const data = await res.json();
    allCars = Array.isArray(data) ? data : (data.results || []);
    applyFilters();
  } catch (err) {
    document.getElementById('carsGrid').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>Failed to load cars</h3>
        <p>Make sure your Django server is running at localhost:8000</p>
      </div>`;
    console.error(err);
  }
}

fetchAllCars();
loadCounts();
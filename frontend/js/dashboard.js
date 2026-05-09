const API = '/api';

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

function toggleDark(track) {
  document.body.classList.toggle('dark');
  track.querySelector('.toggle-thumb').style.transform =
    document.body.classList.contains('dark') ? 'translateX(20px)' : 'translateX(0)';
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

// ── RECENT TRANSACTIONS ──────────────────────────────────────────────
function renderTransactions(rentals) {
  const container = document.getElementById('recentTx');
  if (!rentals.length) {
    container.innerHTML = `<div style="text-align:center;color:var(--text-secondary);padding:24px">No transactions yet</div>`;
    return;
  }
  container.innerHTML = rentals.map(r => {
    const date = r.pickup
      ? new Date(r.pickup).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      : '–';
    const imgHtml = r.image
      ? `<img src="${r.image}" alt="${r.car}" style="width:56px;height:40px;object-fit:contain;" onerror="this.parentElement.innerHTML='🚗'" />`
      : '🚗';
    return `
      <div class="tx-item">
        <div class="tx-car-img">${imgHtml}</div>
        <div>
          <div class="tx-name">${r.car || 'Unknown Car'}</div>
          <div class="tx-type">${capitalize(r.car_type) || 'Sport Car'}</div>
        </div>
        <div class="tx-date">${date}</div>
        <div class="tx-price">$${parseFloat(r.total || 0).toFixed(2)}</div>
      </div>`;
  }).join('');
}

// ── LATEST RENTAL DETAIL ──────────────────────────────────────────────
function renderDetailRental(rentals) {
  const container = document.getElementById('detailRental');
  if (!rentals.length) {
    container.innerHTML = `<div style="text-align:center;color:var(--text-secondary);padding:24px">
      No rentals yet. <a href="category.html" style="color:var(--blue)">Rent a car!</a>
    </div>`;
    return;
  }
  const r = rentals[0];
  const imgHtml = r.image
    ? `<img src="${r.image}" alt="${r.car}" style="width:72px;height:56px;object-fit:contain;" onerror="this.parentElement.innerHTML='🚗'" />`
    : '🚗';
  const randomId = '#' + String(Math.floor(Math.random() * 9000 + 1000));

  container.innerHTML = `
    <div class="map-car-info">
      <div class="map-car-img">${imgHtml}</div>
      <div>
        <div class="map-car-name">${r.car || 'Car'}</div>
        <div class="map-car-type">${capitalize(r.car_type) || 'Sport Car'}</div>
      </div>
      <div class="map-car-id">${randomId}</div>
    </div>
    <div class="booking-info">
      <div class="pickup-dropoff">
        <div>
          <div class="booking-dot-row"><span class="dot"></span> Pick – Up</div>
          <div class="booking-fields-inline">
            <div class="booking-field-sm">
              <label>Locations</label>
              <select style="width:100%;padding:8px;border:1px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;background:var(--bg)">
                <option>${r.pickup_location || 'N/A'}</option>
              </select>
            </div>
            <div class="booking-field-sm">
              <label>Date</label>
              <select style="width:100%;padding:8px;border:1px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;background:var(--bg)">
                <option>${r.pickup || '–'}</option>
              </select>
            </div>
            <div class="booking-field-sm">
              <label>Time</label>
              <select style="width:100%;padding:8px;border:1px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;background:var(--bg)">
                <option>${r.pickup_time || '–'}</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <div class="booking-dot-row">
            <span class="dot" style="background:#90A3BF;border-color:#90A3BF;box-shadow:none"></span> Drop – Off
          </div>
          <div class="booking-fields-inline">
            <div class="booking-field-sm">
              <label>Locations</label>
              <select style="width:100%;padding:8px;border:1px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;background:var(--bg)">
                <option>${r.dropoff_location || 'N/A'}</option>
              </select>
            </div>
            <div class="booking-field-sm">
              <label>Date</label>
              <select style="width:100%;padding:8px;border:1px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;background:var(--bg)">
                <option>${r.dropoff || '–'}</option>
              </select>
            </div>
            <div class="booking-field-sm">
              <label>Time</label>
              <select style="width:100%;padding:8px;border:1px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;background:var(--bg)">
                <option>${r.dropoff_time || '–'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="total-rental">
      <div class="total-rental-label">
        <p>Total Rental Price</p>
        <small>Overall price and includes rental discount</small>
      </div>
      <div class="total-rental-price">$${parseFloat(r.total || 0).toFixed(2)}</div>
    </div>`;
}

// ── FETCH DASHBOARD ──────────────────────────────────────────────
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/dashboard/`);
    if (!res.ok) throw new Error('Dashboard API error');
    const data = await res.json();

    document.getElementById('statCars').textContent    = data.total_cars ?? '–';
    document.getElementById('statRentals').textContent = data.total_rentals ?? '–';
    document.getElementById('statRevenue').textContent =
      data.revenue != null ? `$${parseFloat(data.revenue).toFixed(2)}` : '$0.00';
    document.getElementById('donutTotal').textContent  =
      (data.total_rentals || 0).toLocaleString();

    const rentals = (data.recent_rentals || []).map(r => ({
      car:              r.car,
      car_type:         r.car_type,
      image:            r.image,
      total:            r.total,
      pickup:           r.pickup,
      dropoff:          r.dropoff,
      pickup_location:  r.pickup_location,
      dropoff_location: r.dropoff_location,
      pickup_time:      r.pickup_time,
      dropoff_time:     r.dropoff_time,
      customer:         r.customer,
    }));

    renderTransactions(rentals);
    renderDetailRental(rentals);

  } catch (err) {
    console.error(err);
    document.getElementById('recentTx').innerHTML = `
      <div style="text-align:center;color:var(--text-secondary);padding:24px">
        <p>Could not load transactions</p>
      </div>`;
    document.getElementById('detailRental').innerHTML = `
      <div style="text-align:center;color:var(--text-secondary);padding:24px">
        <p>No rental data available</p>
        <a href="category.html" style="color:var(--blue);font-weight:600">Browse & Rent a Car →</a>
      </div>`;
    document.getElementById('statCars').textContent    = '–';
    document.getElementById('statRentals').textContent = '–';
    document.getElementById('statRevenue').textContent = '$0.00';
  }
}

loadDashboard();
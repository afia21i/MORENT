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

function formatDate(val) {
  if (!val) return '–';
  const d = new Date(val);
  return isNaN(d) ? val : d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(val) {
  if (!val) return '–';
  return val.slice(0, 5);
}

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
        <div style="flex:1;min-width:0">
          <div class="tx-name">${r.car || 'Unknown Car'}</div>
          <div class="tx-type">${capitalize(r.car_type) || 'Sport Car'}</div>
        </div>
        <div class="tx-date">${date}</div>
        <div class="tx-price">$${parseFloat(r.total || 0).toFixed(2)}</div>
      </div>`;
  }).join('');
}

function renderDetailRental(rentals) {
  const container = document.getElementById('detailRental');
  if (!rentals.length) {
    container.innerHTML = `
      <div style="text-align:center;color:var(--text-secondary);padding:40px 0">
        No rentals yet. <a href="/category.html" style="color:var(--blue);font-weight:600">Rent a car!</a>
      </div>`;
    return;
  }

  const r = rentals[0];
  const imgHtml = r.image
    ? `<img src="${r.image}" alt="${r.car}" style="width:72px;height:56px;object-fit:contain;" onerror="this.parentElement.innerHTML='🚗'" />`
    : '🚗';
  const bookingId = '#' + String(Math.floor(Math.random() * 9000 + 1000));

  function fieldBox(value) {
    return `<div class="field-value">${value}<span class="field-chevron">▾</span></div>`;
  }

  container.innerHTML = `
    <div class="map-car-info">
      <div class="map-car-img">${imgHtml}</div>
      <div style="flex:1;min-width:0">
        <div class="map-car-name">${r.car || 'Car'}</div>
        <div class="map-car-type">${capitalize(r.car_type) || 'Sport Car'}</div>
      </div>
      <div class="map-car-id">${bookingId}</div>
    </div>
    <div class="booking-info">
      <div class="pickup-dropoff">
        <div>
          <div class="booking-dot-row"><span class="dot-blue"></span> Pick – Up</div>
          <div class="booking-fields-inline">
            <div class="booking-field-sm"><label>Locations</label>${fieldBox(r.pickup_location || 'N/A')}</div>
            <div class="booking-field-sm"><label>Date</label>${fieldBox(formatDate(r.pickup))}</div>
            <div class="booking-field-sm"><label>Time</label>${fieldBox(formatTime(r.pickup_time))}</div>
          </div>
        </div>
        <div>
          <div class="booking-dot-row"><span class="dot-grey"></span> Drop – Off</div>
          <div class="booking-fields-inline">
            <div class="booking-field-sm"><label>Locations</label>${fieldBox(r.dropoff_location || 'N/A')}</div>
            <div class="booking-field-sm"><label>Date</label>${fieldBox(formatDate(r.dropoff))}</div>
            <div class="booking-field-sm"><label>Time</label>${fieldBox(formatTime(r.dropoff_time))}</div>
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

async function loadDashboard() {
  try {
    const res = await fetch(`${API}/dashboard/`);
    if (!res.ok) throw new Error('Dashboard API error');
    const data = await res.json();

    const donutEl = document.getElementById('donutTotal');
    if (donutEl) donutEl.textContent = (data.total_rentals || 0).toLocaleString();

    const rentals = (data.recent_rentals || []).map(r => ({
      car: r.car, car_type: r.car_type, image: r.image,
      total: r.total, pickup: r.pickup, dropoff: r.dropoff,
      pickup_location: r.pickup_location, dropoff_location: r.dropoff_location,
      pickup_time: r.pickup_time, dropoff_time: r.dropoff_time,
      customer: r.customer,
    }));

    renderTransactions(rentals);
    renderDetailRental(rentals);

  } catch (err) {
    console.error('Dashboard error:', err);
    document.getElementById('recentTx').innerHTML =
      `<div style="text-align:center;color:var(--text-secondary);padding:24px">Could not load transactions.</div>`;
    document.getElementById('detailRental').innerHTML =
      `<div style="text-align:center;color:var(--text-secondary);padding:40px 0">
        No rental data available.
        <a href="/category.html" style="color:var(--blue);font-weight:600">Browse &amp; Rent a Car →</a>
      </div>`;
  }
}

loadDashboard();
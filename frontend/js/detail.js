const API = '/api';
const params = new URLSearchParams(window.location.search);
const carId = params.get('id');

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function stars(rating) {
  const r = parseFloat(rating) || 4.5;
  return [...Array(5)].map((_, i) => {
    if (i < Math.floor(r)) return '★';
    if (i < r) return '⯨';
    return '☆';
  }).join('');
}

function carImageHTML(car) {
  if (car.image) {
    return `<img src="${car.image}" alt="${car.name}" onerror="this.src=''" />`;
  }
  return `<div style="font-size:80px;line-height:1">🚗</div>`;
}

function heartIcon(liked) {
  return liked
    ? `<svg fill="#ED3F3F" stroke="#ED3F3F" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    : `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

function getLiked(id) { return JSON.parse(localStorage.getItem('liked') || '[]').includes(id); }

function renderDetail(car) {
  const liked = getLiked(car.id);
  const imgHTML = carImageHTML(car);
  const ratingVal = parseFloat(car.rating) || 4.5;
  document.getElementById('detailContent').innerHTML = `
    <div class="detail-layout">
      <div class="image-panel">
        <div class="main-image-wrap">
          ${imgHTML}
          <div class="car-caption">${car.description || ''}</div>
        </div>
        <div class="thumbnail-row">
          <div class="thumb active">${imgHTML}</div>
          <div class="thumb" style="background:linear-gradient(135deg,#e8eef6,#d0dcf0)">${imgHTML}</div>
          <div class="thumb" style="background:linear-gradient(135deg,#f0e8f6,#d0c0e0)">${imgHTML}</div>
        </div>
      </div>

      <div class="info-panel">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="car-title">${car.name}</div>
          <button class="heart-btn ${liked?'liked':''}" id="heartBtn" onclick="toggleHeart(${car.id})" style="padding:4px">
            ${heartIcon(liked)}
          </button>
        </div>
        <div class="rating-row">
          <div class="stars" style="color:#FBAD39;font-size:18px">${stars(ratingVal)}</div>
          <span class="review-count">${car.reviews || 0}+ Reviewer</span>
        </div>
        <p class="car-desc">${car.description || 'A premium ' + capitalize(car.type) + ' car with exceptional performance, comfort, and style. Perfect for any occasion from business trips to weekend adventures.'}</p>
        <div class="specs-grid">
          <div class="spec-item"><span class="spec-label">Type Car</span><span class="spec-val">${capitalize(car.type)}</span></div>
          <div class="spec-item"><span class="spec-label">Capacity</span><span class="spec-val">${car.seats} People</span></div>
          <div class="spec-item"><span class="spec-label">Transmission</span><span class="spec-val">${capitalize(car.transmission)}</span></div>
          <div class="spec-item"><span class="spec-label">Fuel</span><span class="spec-val">${car.fuel_capacity}L</span></div>
          <div class="spec-item"><span class="spec-label">Horsepower</span><span class="spec-val">${car.horsepower || 500} HP</span></div>
          <div class="spec-item"><span class="spec-label">Top Speed</span><span class="spec-val">${car.top_speed || 280} km/h</span></div>
        </div>
        <div class="detail-footer">
          <div>
            <div class="big-price">$${parseFloat(car.price_per_day).toFixed(2)}<span>/day</span></div>
            <small>$${(parseFloat(car.price_per_day) * 1.25).toFixed(2)}</small>
          </div>
          <button class="btn btn-primary" onclick="goPayment(${car.id}, '${car.name}', ${car.price_per_day})">Rent Now</button>
        </div>
      </div>
    </div>`;
}

function toggleHeart(id) {
  let liked = JSON.parse(localStorage.getItem('liked') || '[]');
  const btn = document.getElementById('heartBtn');
  if (liked.includes(id)) { liked = liked.filter(x => x !== id); btn.classList.remove('liked'); btn.innerHTML = heartIcon(false); }
  else { liked.push(id); btn.classList.add('liked'); btn.innerHTML = heartIcon(true); }
  localStorage.setItem('liked', JSON.stringify(liked));
}

function goPayment(id, name, price) {
  sessionStorage.setItem('booking', JSON.stringify({ car_id: id, car_name: name, price_per_day: price }));
  window.location.href = `payment.html?car=${id}`;
}

function buildSmallCard(car) {
  const liked = getLiked(car.id);
  const imgHTML = car.image
    ? `<img class="car-image" src="${car.image}" alt="${car.name}"
        onerror="this.parentElement.innerHTML='<div class=car-image-placeholder>🚗</div>'" />`
    : `<div class="car-image-placeholder">🚗</div>`;

  return `
    <div class="car-card" onclick="window.location='detail.html?id=${car.id}'" style="cursor:pointer">
      <div class="car-card-header">
        <div><div class="car-name">${car.name}</div><div class="car-type">${capitalize(car.type)}</div></div>
        <button class="heart-btn ${liked?'liked':''}" onclick="event.stopPropagation();toggleLike(event,${car.id},this)">${heartIcon(liked)}</button>
      </div>
      <div style="height:80px;display:flex;align-items:center;justify-content:center;margin:12px 0">
        ${imgHTML}
      </div>
      <div class="car-specs">
        <div class="spec"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-7"/></svg>${car.fuel_capacity}L</div>
        <div class="spec"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4"/></svg>${capitalize(car.transmission)}</div>
        <div class="spec"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>${car.seats}P</div>
      </div>
      <div class="car-footer">
        <div class="car-price">$${parseFloat(car.price_per_day).toFixed(2)}<span>/day</span></div>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();goPayment(${car.id},'${car.name}',${car.price_per_day})">Rent Now</button>
      </div>
    </div>`;
}

function toggleLike(e, id, btn) {
  e.stopPropagation();
  let liked = JSON.parse(localStorage.getItem('liked') || '[]');
  if (liked.includes(id)) { liked = liked.filter(x => x !== id); btn.classList.remove('liked'); }
  else { liked.push(id); btn.classList.add('liked'); }
  localStorage.setItem('liked', JSON.stringify(liked));
}

async function init() {
  if (!carId) { window.location.href = '/'; return; }
  try {
    const [carRes, similarRes] = await Promise.all([
      fetch(`${API}/cars/${carId}/`),
      fetch(`${API}/cars/?type=sport`),
    ]);
    const car = await carRes.json();
    const similar = await similarRes.json();
    renderDetail(car);
    const others = (Array.isArray(similar) ? similar : similar.results || [])
      .filter(c => c.id !== parseInt(carId))
      .slice(0, 4);
    document.getElementById('similarCars').innerHTML = others.length
      ? others.map(buildSmallCard).join('')
      : '<div style="grid-column:1/-1;text-align:center;color:#90A3BF">No similar cars</div>';
  } catch (err) {
    document.getElementById('detailContent').innerHTML = `
      <div class="empty-state">
        <h3>Car not found</h3>
        <p><a href="category.html" style="color:var(--blue)">Back to Browse</a></p>
      </div>`;
    console.error(err);
  }
}

init();
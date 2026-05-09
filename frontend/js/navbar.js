document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('navbar-placeholder').innerHTML = `
    <nav class="navbar">
      <div class="logo">MORENT</div>

      <div class="search-bar">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Search something here" id="searchInput" />
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="4"  y1="6"  x2="20" y2="6"/>
          <line x1="8"  y1="6"  x2="8"  y2="3"/>
          <line x1="8"  y1="6"  x2="8"  y2="9"/>
          <line x1="4"  y1="12" x2="20" y2="12"/>
          <line x1="16" y1="12" x2="16" y2="9"/>
          <line x1="16" y1="12" x2="16" y2="15"/>
          <line x1="4"  y1="18" x2="20" y2="18"/>
          <line x1="12" y1="18" x2="12" y2="15"/>
          <line x1="12" y1="18" x2="12" y2="21"/>
        </svg>
      </div>

      <div class="nav-icons">
        <button class="nav-icon-btn" onclick="window.location='category.html'" title="Favourites">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button class="nav-icon-btn" title="Notifications">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="badge"></span>
        </button>
        <button class="nav-icon-btn" title="Settings">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <img class="nav-avatar"
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=morent"
          alt="avatar"
          onclick="window.location.href='dashboard.html'"
          style="cursor:pointer" />
      </div>
    </nav>
  `;
});
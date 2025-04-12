// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCc-fhltUqlZSzxBFbMF8YiquHRV1DU_II",
  authDomain: "hostel11-8e824.firebaseapp.com",
  projectId: "hostel11-8e824",
  storageBucket: "hostel11-8e824.firebasestorage.app",
  messagingSenderId: "897632815925",
  appId: "1:897632815925:web:411eee3b02718dd08b5a7c"
};

firebase.initializeApp(firebaseConfig);

// DOM Elements
const profileImg = document.getElementById('profileImg');
const profileDropdown = document.getElementById('profileDropdown');
const usernameElement = document.getElementById('username');
const authButtonsContainer = document.getElementById('authButtons');
const predictTodayBtn = document.getElementById('predictTodayBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const closePredictionModalBtn = document.getElementById('closePredictionModalBtn');
const closeLeaderboardModalBtn = document.getElementById('closeLeaderboardModalBtn');
const predictionModal = document.getElementById('predictionModal');
const themeSwitch = document.getElementById('themeSwitch');
const body = document.body;
const mainWalletBtn = document.getElementById('walletBtn');

// Profile Dropdown functionality
profileImg.addEventListener('click', () => {
  profileDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!profileImg.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.classList.remove('active');
  }
});

// Update UI based on authentication state
// Update UI based on authentication state
function updateUIForAuthState(user) {
  // Clear previous auth buttons
  authButtonsContainer.innerHTML = '';

  if (user) {
    // User is signed in
    usernameElement.textContent = user.displayName || 'Cricket Fan';

    // Set profile image if available
    if (user.photoURL) {
      profileImg.src = user.photoURL;
    } else {
      // Fallback to placeholder or default image
      profileImg.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.displayName || 'User') + "&background=cd5965&color=fff";
    }

    // Add wallet button
    const walletBtn = document.createElement('button');
    walletBtn.className = 'wallet-btn';
    walletBtn.innerHTML = '<i class="material-icons">account_balance_wallet</i>Check Wallet Balance';
    walletBtn.addEventListener('click', () => {
      goToLink('wallet'); // Navigate to wallet page
      profileDropdown.classList.remove('active');
    });
    authButtonsContainer.appendChild(walletBtn);

    // Add Contact Us button
    const contactBtn = document.createElement('button');
    contactBtn.className = 'auth-btn';
    contactBtn.innerHTML = '<i class="material-icons">contact_support</i>Contact Us';
    contactBtn.addEventListener('click', () => {
      goToLink('contact'); // Navigate to contact page
      profileDropdown.classList.remove('active');
    });
    authButtonsContainer.appendChild(contactBtn);

    // Add a divider
    const divider = document.createElement('div');
    divider.className = 'divider';
    authButtonsContainer.appendChild(divider);

    // Add logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'auth-btn';
    logoutBtn.innerHTML = '<i class="material-icons">logout</i>Logout';
    logoutBtn.addEventListener('click', () => {
      firebase.auth().signOut().then(() => {
        profileDropdown.classList.remove('active');
      }).catch((error) => {
        console.error('Error signing out:', error);
      });
    });
    authButtonsContainer.appendChild(logoutBtn);

  } else {
    // No user is signed in, use defaults
    usernameElement.textContent = 'Guest';
    profileImg.src = "https://ui-avatars.com/api/?name=Guest&background=cd5965&color=fff";

    // Add sign in button
    const signInBtn = document.createElement('button');
    signInBtn.className = 'auth-btn';
    signInBtn.innerHTML = '<i class="material-icons">login</i>Sign In';
    signInBtn.addEventListener('click', () => {
      // Implement sign in functionality here
      alert('Sign in functionality will be implemented here');
      profileDropdown.classList.remove('active');
    });
    authButtonsContainer.appendChild(signInBtn);

    // Add wallet button after sign in
    const walletBtn = document.createElement('button');
    walletBtn.className = 'wallet-btn';
    walletBtn.innerHTML = '<i class="material-icons">account_balance_wallet</i>Check Wallet Balance';
    walletBtn.addEventListener('click', () => {
      goToLink('wallet'); // Navigate to wallet page
      profileDropdown.classList.remove('active');
    });
    authButtonsContainer.appendChild(walletBtn);

    // Add Contact Us button
    const contactBtn = document.createElement('button');
    contactBtn.className = 'auth-btn';
    contactBtn.innerHTML = '<i class="material-icons">contact_support</i>Contact Us';
    contactBtn.addEventListener('click', () => {
      alert('Contact Us page will open here');
      profileDropdown.classList.remove('active');
    });
    authButtonsContainer.appendChild(contactBtn);
  }
}

// Listen for auth state changes
firebase.auth().onAuthStateChanged((user) => {
  updateUIForAuthState(user);
});

// Modal functionality
predictTodayBtn.addEventListener('click', () => {
  predictionModal.classList.add('active');
});
leaderboardBtn.addEventListener('click', () => {
  leaderboardModal.classList.add('active');
});

closePredictionModalBtn.addEventListener('click', () => {
  predictionModal.classList.remove('active');
});
closeLeaderboardModalBtn.addEventListener('click', () => {
  leaderboardModal.classList.remove('active');
});

// Close modal when clicking outside
predictionModal.addEventListener('click', (e) => {
  if (e.target === predictionModal) {
    predictionModal.classList.remove('active');
  }
});
leaderboardModal.addEventListener('click', (e) => {
  if (e.target === leaderboardModal) {
    leaderboardModal.classList.remove('active');
  }
});

// Theme toggle functionality
// Check for saved theme preference or default to light mode
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark-mode');
  themeSwitch.checked = true;
}

themeSwitch.addEventListener('change', () => {
  // Toggle dark mode class
  body.classList.toggle('dark-mode');

  // Save theme preference
  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Main wallet button functionality
mainWalletBtn.addEventListener('click', () => {
  goToLink('wallet'); // Navigate to wallet page
});

/**
* Navigates to the URL or path passed as a parameter
* @param {string} url - The URL or path to navigate to
*/
function goToLink(url) {
  // Basic URL validation
  if (!url) {
    console.error('No URL provided');
    return;
  }

  // Handle different URL scenarios
  if (url.startsWith('/')) {
    // If it starts with a slash, it's a path relative to the domain root
    window.location.href = window.location.origin + url;
  } else if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it has a protocol, it's a full URL
    window.location.href = url;
  } else if (url.includes('://')) {
    // Other protocols like ftp://, etc.
    window.location.href = url;
  } else if (url.startsWith('#')) {
    // Anchor on the same page
    window.location.href = window.location.pathname + url;
  } else {
    // Treat as a relative path from current location
    // Remove trailing slash from current path if needed
    const basePath = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : window.location.pathname + '/';

    window.location.href = window.location.origin + basePath + url;
  }
}

// Example usage:
// goToLink('wallet');           // Navigates to current path + /wallet
// goToLink('/wallet');          // Navigates to domain root + /wallet
// goToLink('https://example.com/wallet'); // Navigates to full URL

function createLeaderboardCard(matchId, dateStr) {
  // Convert matchId to display text, e.g., "lsgvsgt" -> "LSG vs GT"
  const teams = matchId.toUpperCase().split('VS').join(' vs ');

  // Convert dateStr "120425" -> "12-Apr-2025"
  const day = dateStr.slice(0, 2);
  const monthNum = dateStr.slice(2, 4);
  const year = '20' + dateStr.slice(4, 6);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[parseInt(monthNum) - 1];
  const formattedDate = `${day}-${month}-${year}`;

  const cardHTML2 = `
    <div class="match-item">
      <div class="match-details">
        <div class="match-teams">${teams}</div>
        <div class="match-date">${formattedDate}</div>
      </div>
      <button class="predict-btn" onclick="goToLink('leaderboard?m0=${matchId}');">View</button>
    </div>
  `;
  const container2 = document.getElementById('leaderboardMatchList');
  if (container2) {
    container2.insertAdjacentHTML('beforeend', cardHTML2);
  }
}

function createPredictionCard(matchId, dateStr) {
  // Convert matchId to display text, e.g., "lsgvsgt" -> "LSG vs GT"
  const teams = matchId.toUpperCase().split('VS').join(' vs ');

  // Convert dateStr "120425" -> "12-Apr-2025"
  const day = dateStr.slice(0, 2);
  const monthNum = dateStr.slice(2, 4);
  const year = '20' + dateStr.slice(4, 6);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[parseInt(monthNum) - 1];
  const formattedDate = `${day}-${month}-${year}`;

  // Create the card HTML
  const cardHTML = `
    <div class="match-item">
      <div class="match-details">
        <div class="match-teams">${teams}</div>
        <div class="match-date">${formattedDate}</div>
      </div>
      <button class="predict-btn" onclick="goToLink('form?m0=${matchId}');">Predict</button>
    </div>
  `;
  const cardHTML2 = `
    <div class="match-item">
      <div class="match-details">
        <div class="match-teams">${teams}</div>
        <div class="match-date">${formattedDate}</div>
      </div>
      <button class="predict-btn" onclick="goToLink('leaderboard?m0=${matchId}');">Coming Soon</button>
    </div>
  `;

  // Insert it into #predictionMatchList
  const container = document.getElementById('predictionMatchList');
  if (container) {
    container.insertAdjacentHTML('beforeend', cardHTML);
  }
  const container2 = document.getElementById('leaderboardMatchList');
  if (container2) {
    container2.insertAdjacentHTML('beforeend', cardHTML2);
  }
}

// Example usage of createPredictionCard function
createLeaderboardCard('cskvskkr', '120425');
createLeaderboardCard('lsgvsgt', '120425');
createLeaderboardCard('srhvspbks', '120425');
createPredictionCard('rrvsrcb', '130425');
createPredictionCard('dcvsmi', '130425');
// createPredictionCard('lsgvscsk', '140425');
// createPredictionCard('pbksvskkr', '150425');
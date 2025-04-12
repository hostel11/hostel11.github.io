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
const themeSwitch = document.getElementById('themeSwitch');
const authButtons = document.getElementById('authButtons');
const authContent = document.getElementById('authContent');
const leaderboardBody = document.getElementById('leaderboardBody');
const backToHome = document.getElementById('backToHome');
const filterBtn = document.querySelector('.filter-btn');
const filterOptions = document.querySelector('.filter-options');
const filterOptionElements = document.querySelectorAll('.filter-option');
localStorage.removeItem('darkMode'); // Remove old key if it exists

// Check if dark mode is enabled
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeSwitch.checked = true;
}
// Toggle dark mode
themeSwitch.addEventListener('change', () => {
  // Toggle dark mode class
  document.body.classList.toggle('dark-mode');

  // Save theme preference
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Toggle profile dropdown
profileImg.addEventListener('click', () => {
  profileDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
  if (!profileImg.contains(event.target) && !profileDropdown.contains(event.target)) {
    profileDropdown.classList.remove('active');
  }

  if (!filterBtn.contains(event.target) && !filterOptions.contains(event.target)) {
    filterOptions.classList.remove('active');
  }
});

// Toggle filter dropdown
filterBtn.addEventListener('click', () => {
  filterOptions.classList.toggle('active');
});

// Handle filter selection
filterOptionElements.forEach(option => {
  option.addEventListener('click', () => {
    const filterText = option.textContent;
    filterBtn.textContent = filterText + ' ';
    const icon = document.createElement('i');
    icon.className = 'material-icons';
    icon.textContent = 'arrow_drop_down';
    filterBtn.appendChild(icon);
    filterOptions.classList.remove('active');

    // Here you would fetch data based on the selected filter
    const filterValue = option.getAttribute('data-filter');
    fetchLeaderboardData(filterValue);
  });
});

// Back to home button
backToHome.addEventListener('click', () => {
  window.location.href = '/';
});

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    profileImg.src = user.photoURL || '/api/placeholder/40/40';
    document.getElementById('username').textContent = user.displayName || user.email || 'User';

    // Update auth buttons
    authButtons.innerHTML = `
          <button class="auth-btn" id="walletBalanceBtn">
            <i class="material-icons">account_balance_wallet</i> Wallet Balance
          </button>
          <button class="auth-btn" id="contactUsBtn">
            <i class="material-icons">contact_support</i> Contact Us
          </button>
          <div class="divider"></div>
          <button class="auth-btn" id="signOutBtn">
            <i class="material-icons">exit_to_app</i> Logout
          </button>
        `;

    // Add event listeners for auth buttons
    document.getElementById('signOutBtn').addEventListener('click', () => {
      firebase.auth().signOut();
    });

    document.getElementById('walletBalanceBtn').addEventListener('click', () => {
      // Wallet balance functionality
      alert('Wallet Balance Feature Coming Soon!');
    });

    document.getElementById('contactUsBtn').addEventListener('click', () => {
      // Contact us functionality
      alert('Contact Us Feature Coming Soon!');
    });

    // Fetch and display leaderboard data
    fetchLeaderboardData('all-time');
  } else {
    // User is signed out, show auth prompt
    profileImg.src = '/api/placeholder/40/40';
    document.getElementById('username').textContent = 'Guest';

    // Update auth buttons
    authButtons.innerHTML = `
          <button class="auth-btn" id="signInBtn">
            <i class="material-icons">login</i> Sign In
          </button>
          <button class="auth-btn" id="signUpBtn">
            <i class="material-icons">person_add</i> Sign Up
          </button>
        `;

    // Add event listeners for auth buttons
    document.getElementById('signInBtn').addEventListener('click', () => {
      // Sign in functionality
      signIn();
    });

    document.getElementById('signUpBtn').addEventListener('click', () => {
      // Sign up functionality
      signUp();
    });

    // Show auth prompt
    authContent.innerHTML = `
          <div class="auth-prompt">
            <h3 class="auth-prompt-title">Login Required</h3>
            <p class="auth-prompt-text">You need to be logged in to view the leaderboard and participate in predictions.</p>
            <button class="login-btn" id="promptLoginBtn">Login Now</button>
          </div>
        `;

    document.getElementById('promptLoginBtn').addEventListener('click', () => {
      signIn();
    });

    // Show empty leaderboard with message
    leaderboardBody.innerHTML = `
          <tr>
            <td colspan="3" class="no-data">Login to view the leaderboard</td>
          </tr>
        `;
  }
});

// Sign in function
function signIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).catch((error) => {
    console.error('Error signing in:', error);
    alert('Error signing in. Please try again.');
  });
}

// Sign up function (using Google for simplicity)
function signUp() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).catch((error) => {
    console.error('Error signing up:', error);
    alert('Error signing up. Please try again.');
  });
}

let leaderboardData;

// Modify the fetchLeaderboardDataInitial function
function fetchLeaderboardDataInitial() {
  // Get the URL parameter 'm0'
  const urlParams = new URLSearchParams(window.location.search);
  const paramValue = urlParams.get('m0');

  if (!paramValue) {
    console.error("URL parameter 'm0' not found");
    showNoResultsModal("No match data found. Please try again later.");
    return;
  }

  // Construct the JSON file path using the parameter value
  const jsonFilePath = `${paramValue}.json`;

  // Fetch the JSON file from the same directory
  fetch(jsonFilePath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${jsonFilePath}: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      // Save the data to the leaderboardData variable
      leaderboardData = data;
      console.log(`Successfully loaded data from ${jsonFilePath}`);

      // Check if there were no participants
      if (data.length === 1 && data[0].rank === 0) {
        showNoResultsModal("There were no participants for this match.");
        return;
      }

      // If user is already authenticated, display the leaderboard
      if (firebase.auth().currentUser) {
        fetchLeaderboardData('all-time');
      }
    })
    .catch(error => {
      console.error(`Error fetching leaderboard data: ${error.message}`);
      showNoResultsModal("Results have not been declared yet. Please check back later.");
    });
}

// Function to show modal popup for no results
function showNoResultsModal(message) {
  // Check if modal already exists
  let modal = document.getElementById('noResultsModal');
  
  // If modal doesn't exist, create it
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'noResultsModal';
    modal.className = 'modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    modalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Notice</h3>
      </div>
      <div class="modal-body" style="padding: 20px; text-align: center;">
        <p id="noResultsMessage" style="margin-bottom: 20px;">${message}</p>
      </div>
      <div class="modal-footer">
        <button id="closeNoResultsModal" class="close-btn">Close</button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add event listener to close button
    document.getElementById('closeNoResultsModal').addEventListener('click', () => {
      modal.classList.remove('active');
    });
  } else {
    // Update message if modal already exists
    document.getElementById('noResultsMessage').textContent = message;
  }
  
  // Show the modal
  setTimeout(() => {
    modal.classList.add('active');
  }, 100);
}

// Call the function to execute it
fetchLeaderboardDataInitial();

// Fetch leaderboard data
function fetchLeaderboardData(filterType) {
  // Check if user is authenticated
  if (firebase.auth().currentUser) {
    // Make sure leaderboardData exists
    if (!leaderboardData) {
      console.error("Leaderboard data not loaded yet");
      return;
    }

    // Clear existing data
    leaderboardBody.innerHTML = '';

    // Populate table with data
    leaderboardData.forEach(user => {
      const row = document.createElement('tr');

      // Rank cell with special styling for top 3
      const rankCell = document.createElement('td');
      rankCell.className = `rank rank-${user.rank}`;
      rankCell.textContent = user.rank;

      // Name cell
      const nameCell = document.createElement('td');
      const userCell = document.createElement('div');
      userCell.className = 'user-cell';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = user.name;
      userCell.appendChild(nameSpan);
      nameCell.appendChild(userCell);

      // Points cell
      const pointsCell = document.createElement('td');
      pointsCell.className = 'points';
      pointsCell.textContent = user.points;

      // Append cells to row
      row.appendChild(rankCell);
      row.appendChild(nameCell);
      row.appendChild(pointsCell);

      // Append row to table body
      leaderboardBody.appendChild(row);
    });
  }
}
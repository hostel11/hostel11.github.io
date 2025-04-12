// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCc-fhltUqlZSzxBFbMF8YiquHRV1DU_II",
    authDomain: "hostel11-8e824.firebaseapp.com",
    projectId: "hostel11-8e824",
    storageBucket: "hostel11-8e824.firebasestorage.app",
    messagingSenderId: "897632815925",
    appId: "1:897632815925:web:411eee3b02718dd08b5a7c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const balanceAmount = document.getElementById('balance-amount');
const lastUpdated = document.getElementById('last-updated');
const amountInput = document.getElementById('amount');
const amountError = document.getElementById('amount-error');
const upiMinError = document.getElementById('upi-min-error');
const voucherMinError = document.getElementById('voucher-min-error');
const withdrawBtn = document.getElementById('withdraw-btn');
const successMessage = document.getElementById('success-message');
const profilePic = document.getElementById('profile-pic');
const profilePicContainer = document.getElementById('profile-pic-container');
const profileDropdown = document.getElementById('profile-dropdown');
const userName = document.getElementById('user-name');
const dropdownUsername = document.getElementById('dropdown-username');
const dropdownEmail = document.getElementById('dropdown-email');
const walletContent = document.getElementById('wallet-content');
const loginContainer = document.getElementById('login-container');
const googleLoginBtn = document.getElementById('google-login-btn');
const themeToggleSwitch = document.getElementById('theme-toggle-switch');
const homeBtn = document.getElementById('home-btn');
const contactBtn = document.getElementById('contact-btn');
const logoutDropdownBtn = document.getElementById('logout-dropdown-btn');

// Global variables
let userEmail = '';
let walletBalance = 0;
let walletData = [];
let selectedVoucherMinAmount = 0;
let isDropdownOpen = false;

// Theme handling
function initializeTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggleSwitch.checked = savedTheme === 'dark';
}

// Toggle theme function
function toggleTheme(event) {
    const theme = event.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Initialize theme on page load
initializeTheme();

// Theme toggle event listener
themeToggleSwitch.addEventListener('change', toggleTheme);

// Check if user is logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        userEmail = user.email;
        profilePic.src = user.photoURL || '/api/placeholder/40/40';
        dropdownUsername.textContent = user.displayName || 'User';
        dropdownEmail.textContent = user.email;

        // Show wallet content, hide login container
        walletContent.style.display = 'block';
        loginContainer.style.display = 'none';

        // Fetch wallet data
        fetchWalletData();
    } else {
        // User is not signed in
        userEmail = '';
        walletBalance = 0;
        
        // Show login container, hide wallet content
        walletContent.style.display = 'none';
        loginContainer.style.display = 'block';
    }
});

// Google sign-in function
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch((error) => {
        showPopup(`Login Error: ${error.message}`);
    });
}

// Add event listener to Google login button
googleLoginBtn.addEventListener('click', signInWithGoogle);

// Profile dropdown toggle
profilePicContainer.addEventListener('click', function(e) {
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
    
    if (isDropdownOpen) {
        profileDropdown.style.display = 'block';
    } else {
        profileDropdown.style.display = 'none';
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', function() {
    if (isDropdownOpen) {
        profileDropdown.style.display = 'none';
        isDropdownOpen = false;
    }
});

// Prevent dropdown from closing when clicking inside it
profileDropdown.addEventListener('click', function(e) {
    e.stopPropagation();
});

// Add event listeners for dropdown items
homeBtn.addEventListener('click', function() {
    // Navigate to home page
    window.location.href = '/';
});

contactBtn.addEventListener('click', function() {
      goToLink('/contact'); // Navigate to contact page
});

logoutDropdownBtn.addEventListener('click', function() {
    auth.signOut().then(() => {
        // Clear user data and reset UI
        userEmail = '';
        walletBalance = 0;
        balanceAmount.textContent = '₹0.00';
        profilePic.src = '/api/placeholder/40/40';
        userName.textContent = 'Not logged in';
        
        // Hide dropdown
        profileDropdown.style.display = 'none';
        isDropdownOpen = false;
        
        // Show login container, hide wallet content
        walletContent.style.display = 'none';
        loginContainer.style.display = 'block';
    }).catch((error) => {
        showPopup(`Logout Error: ${error.message}`);
    });
});

// Fetch wallet data
async function fetchWalletData() {
    try {
        // Generate timestamp to prevent caching
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

        const url = `https://hostel11.github.io/wallet.json?ts=${timestamp}`;

        // Fetch wallet data from the URL
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch wallet data: ${response.status}`);
        }

        walletData = await response.json();
        
        // Find user's balance
        const userWallet = walletData.find(item => item.email === userEmail);
        if (userWallet) {
            walletBalance = parseFloat(userWallet.balance);
            balanceAmount.textContent = `₹${walletBalance.toFixed(2)}`;
            document.getElementById('mobile').setAttribute('value', `${userWallet.mobile}`);
            
            // If mobile number exists in wallet data, pre-fill it
            if (userWallet.mobile) {
                document.getElementById('mobile').value = userWallet.mobile;
            }

            // Update last updated timestamp
            const now = new Date();
            lastUpdated.textContent = `Last updated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        } else {
            balanceAmount.textContent = '₹0.00';
        }
    } catch (error) {
        console.error("Error fetching wallet data:", error);
        showPopup(`Error fetching wallet data: ${error.message}`);
    }
}

// Tab switching functionality
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));

        // Add active class to clicked tab
        tab.classList.add('active');

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show selected tab content
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}-content`).classList.add('active');

        // Reset errors
        upiMinError.style.display = 'none';
        voucherMinError.style.display = 'none';

        // Validate amount based on selected tab
        validateAmount();
    });
});

// Amount validation
amountInput.addEventListener('input', validateAmount);

function validateAmount() {
    const amount = parseFloat(amountInput.value);
    const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');

    // Reset error messages
    amountError.style.display = 'none';
    upiMinError.style.display = 'none';
    voucherMinError.style.display = 'none';
    withdrawBtn.disabled = false;

    // Check if amount is valid
    if (!amount || isNaN(amount) || amount <= 0) {
        withdrawBtn.disabled = true;
        return false;
    }

    // Check if amount exceeds balance
    if (amount > walletBalance) {
        amountError.style.display = 'block';
        withdrawBtn.disabled = true;
        return false;
    }

    // Check minimum for UPI transfer
    if (activeTab === 'upi' && amount < 50) {
        upiMinError.style.display = 'block';
        withdrawBtn.disabled = true;
        return false;
    }

    // Check minimum for selected voucher
    if (activeTab === 'voucher') {
        const selectedVoucher = document.querySelector('.voucher-item.selected');
        if (selectedVoucher) {
            const minAmount = parseInt(selectedVoucher.getAttribute('data-min'));
            selectedVoucherMinAmount = minAmount;

            if (amount < minAmount) {
                voucherMinError.textContent = `Minimum withdrawal amount for this voucher is ₹${minAmount}`;
                voucherMinError.style.display = 'block';
                withdrawBtn.disabled = true;
                return false;
            }
        } else {
            // No voucher selected yet
            withdrawBtn.disabled = true;
            return false;
        }
    }

    return true;
}

// Voucher selection
function selectVoucher(element) {
    // Remove selected class from all vouchers
    document.querySelectorAll('.voucher-item').forEach(voucher => {
        voucher.classList.remove('selected');
    });

    // Add selected class to clicked voucher
    element.classList.add('selected');

    // Update min amount and re-validate
    selectedVoucherMinAmount = parseInt(element.getAttribute('data-min'));
    validateAmount();
}

// Process withdrawal
function processWithdrawal() {
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        showPopup('Please enter a valid amount');
        return;
    }

    if (!validateAmount()) {
        return;
    }

    const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');
    let modeOfPayment = '';
    let mobileno = '';
    let upiId = '';
    let giftCardName = '';

    if (activeTab === 'upi') {
        modeOfPayment = 'UPI Transfer';
        mobileno = document.getElementById('mobile').value;
        if (!mobileno || mobileno.length !== 10) {
            showPopup('Please enter a valid 10-digit mobile number');
            return;
        }
        upiId = document.getElementById('upi-id').value || '';
    } else if (activeTab === 'voucher') {
        modeOfPayment = 'Gift Card';
        const selectedVoucher = document.querySelector('.voucher-item.selected');
        if (!selectedVoucher) {
            showPopup('Please select a voucher');
            return;
        }
        giftCardName = selectedVoucher.querySelector('.voucher-name').textContent;
    }

    // Prepare data for submission
    const formData = new FormData();

    // Add user info to the form data
    formData.append('Email', userEmail);
    formData.append('UserName', userName.textContent);
    console.log('Withdrawal details:', `Amount: ${amount}, Mode: ${modeOfPayment}`);

    // Add withdrawal details
    formData.append('Mode of Payment', modeOfPayment);
    formData.append('Amount', amount.toString());
    formData.append('Mobile No', mobileno);
    formData.append('UPI ID', upiId);
    formData.append('Name of Gift Card', giftCardName);

    // Add timestamp (using IST format like the survey function)
    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    formData.append('Timestamp', istTime);

    // Get Google Apps Script Web App URL
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxiBjE2d0rGbDNiWqTB_cvpFs6Xstq2T_zdbuD8xtqVf3HCWU_6U08SvyutnuFjE2IX/exec';

    // Disable button during submission
    withdrawBtn.disabled = true;
    withdrawBtn.textContent = 'Processing...';

    // Submit the form using the same pattern as submitSurvey
    fetch(scriptURL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Use no-cors mode like the survey function
    })
        .then(() => {
            // Show success message
            successMessage.style.display = 'block';

            // Reset form
            setTimeout(() => {
                amountInput.value = '';
                document.getElementById('upi-id').value = '';
                document.querySelectorAll('.voucher-item').forEach(v => v.classList.remove('selected'));

                // Reset button
                withdrawBtn.disabled = false;
                withdrawBtn.textContent = 'Withdraw Now';
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }, 3000);
        })
        .catch(error => {
            console.error('Error:', error);
            showPopup('There was an error processing your withdrawal. Please try again.');
            
            // Reset button
            withdrawBtn.disabled = false;
            withdrawBtn.textContent = 'Withdraw Now';
        });
}

// Popup functions
function showPopup(message) {
    const popup = document.getElementById('error-popup');
    const popupMessage = document.getElementById('popup-message');

    popupMessage.textContent = message;
    popup.style.display = 'flex';
}

function closePopup() {
    const popup = document.getElementById('error-popup');
    popup.style.display = 'none';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initially hide profile dropdown
    profileDropdown.style.display = 'none';
    
    // Initialize UPI tab as active by default
    document.querySelector('.tab[data-tab="upi"]').click();
    
    // Check for any saved theme preference
    initializeTheme();
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
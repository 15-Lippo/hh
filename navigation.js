// Simplified navigation handlers with English context
function setupNavigation(showSectionFn) {
  document.getElementById('nav-home').addEventListener('click', () => {
    showSectionFn('feed');
  });
  
  document.getElementById('nav-search').addEventListener('click', () => {
    showSectionFn('search');
  });
  
  document.getElementById('nav-create').addEventListener('click', () => {
    showSectionFn('create');
  });
  
  document.getElementById('nav-activity').addEventListener('click', () => {
    showSectionFn('activity');
  });
  
  document.getElementById('nav-profile').addEventListener('click', () => {
    showSectionFn('profile');
  });
}

// Show/hide sections based on navigation
function showSection(sectionId) {
  // Hide all sections
  const sections = [
    'feed-section', 
    'search-section', 
    'create-section', 
    'activity-section', 
    'profile-section', 
    'challenge-details-section', 
    'submit-entry-section',
    'login-section',
    'register-form-container',
    'forgot-password-container',
    'reset-password-container'
  ];

  sections.forEach(section => {
    const element = document.getElementById(section);
    if (element) {
      element.classList.add('hidden');
    }
  });
  
  // Show selected section
  const sectionMap = {
    'feed': 'feed-section',
    'search': 'search-section',
    'create': 'create-section',
    'activity': 'activity-section',
    'profile': 'profile-section',
    'challenge-details': 'challenge-details-section',
    'submit-entry': 'submit-entry-section',
    'login-section': 'login-section',
    'register': 'register-form-container',
    'forgot-password': 'forgot-password-container',
    'reset-password': 'reset-password-container'
  };

  const targetSectionId = sectionMap[sectionId];
  if (targetSectionId) {
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
  }
}

// Aggiungo la gestione degli eventi per la navigazione tra i form di autenticazione
document.addEventListener('DOMContentLoaded', () => {
  // Gestione del link "Create Account"
  const showRegisterLink = document.getElementById('show-register');
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('register');
    });
  }

  // Gestione del link "Forgot Password"
  const forgotPasswordLink = document.getElementById('forgot-password');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('forgot-password');
    });
  }

  // Gestione del link "Back to Login"
  const backToLoginLink = document.getElementById('back-to-login');
  if (backToLoginLink) {
    backToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('login-section');
    });
  }
});

export { setupNavigation, showSection };

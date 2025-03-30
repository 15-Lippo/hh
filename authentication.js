import { AUTH_SETTINGS } from './config.js';
import { showSection } from './navigation.js';

// Enhanced email validation function
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to find user by email
function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const userKeys = Object.keys(localStorage)
    .filter(key => key.startsWith(AUTH_SETTINGS.STORAGE_KEY + '_'));

  return userKeys.find(key => {
    const userProfile = JSON.parse(localStorage.getItem(key));
    return userProfile.email.toLowerCase().trim() === normalizedEmail;
  });
}

function isEmailUnique(email) {
  // Validate email format first
  if (!validateEmail(email)) {
    alert('Please enter a valid email address.');
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUserKey = findUserByEmail(normalizedEmail);
  
  if (existingUserKey) {
    alert("Un account con questa email è già registrato. Utilizza un'altra email.");
    return false;
  }
  
  return true;
}

// Simulated email sending function (to be replaced with actual email service)
function sendPasswordResetEmail(email, resetToken) {
  // In a real-world scenario, this would use an actual email service API
  console.log(`Password Reset Email Sent to ${email}`);
  console.log(`Reset Token: ${resetToken}`);
  
  // Store reset token with expiration
  const resetData = {
    email: email.toLowerCase().trim(),
    token: resetToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  localStorage.setItem(`reset_token_${email.toLowerCase().trim()}`, JSON.stringify(resetData));
  
  // Simulate email notification
  alert(`Un link per il reset della password è stato inviato a ${email}. Controlla la tua casella di posta.`);
}

function generateResetToken() {
  // Generate a more secure, unique reset token
  // Using a more browser-compatible approach instead of crypto.randomUUID()
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function initiatePasswordReset(email) {
  // Validate email format
  if (!email || !validateEmail(email)) {
    alert('Inserisci un indirizzo email valido.');
    return false;
  }

  // Normalizza l'email prima di cercarla
  const normalizedEmail = email.toLowerCase().trim();
  const existingUserKey = findUserByEmail(normalizedEmail);

  if (existingUserKey) {
    try {
      const resetToken = generateResetToken();
      
      // Store reset token with expiration
      const resetData = {
        email: normalizedEmail,
        token: resetToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      localStorage.setItem(`reset_token_${normalizedEmail}`, JSON.stringify(resetData));
      
      // Simulate email notification
      alert(`Un link per il reset della password è stato inviato a ${normalizedEmail}. Controlla la tua casella di posta.`);
      
      return true;
    } catch (error) {
      console.error('Errore durante il reset della password:', error);
      alert('Si è verificato un errore durante il reset della password. Riprova più tardi.');
      return false;
    }
  } else {
    alert('Nessun account trovato con questo indirizzo email.');
    return false;
  }
}

function validateResetToken(email, token) {
  const storedResetData = localStorage.getItem(`reset_token_${email.toLowerCase().trim()}`);
  
  if (!storedResetData) return false;

  const resetData = JSON.parse(storedResetData);
  
  // Check token validity and expiration
  const isValidToken = resetData.token === token;
  const isTokenExpired = Date.now() > resetData.expiresAt;
  
  return isValidToken && !isTokenExpired;
}

function resetPassword(email, newPassword, token) {
  // Validate reset token first
  if (!validateResetToken(email, token)) {
    alert('Token di reset non valido o scaduto.');
    return false;
  }

  // Validate password
  if (!newPassword || newPassword.length < AUTH_SETTINGS.MIN_PASSWORD_LENGTH || 
      newPassword.length > AUTH_SETTINGS.MAX_PASSWORD_LENGTH) {
    alert(`La password deve essere compresa tra ${AUTH_SETTINGS.MIN_PASSWORD_LENGTH} e ${AUTH_SETTINGS.MAX_PASSWORD_LENGTH} caratteri`);
    return false;
  }

  // Find and update user profile
  const userKeys = Object.keys(localStorage)
    .filter(key => key.startsWith(AUTH_SETTINGS.STORAGE_KEY + '_'));

  const userKey = userKeys.find(key => {
    const userProfile = JSON.parse(localStorage.getItem(key));
    return userProfile.email.toLowerCase().trim() === email.toLowerCase().trim();
  });

  if (userKey) {
    // In a real app, you'd hash the password
    const userProfile = JSON.parse(localStorage.getItem(userKey));
    
    // Update user profile (normally, you'd store a hashed password)
    localStorage.setItem(userKey, JSON.stringify({
      ...userProfile,
      password: newPassword,  // In a real app, use password hashing
      passwordLastChanged: new Date().toISOString() // Traccia quando è stata cambiata l'ultima volta
    }));

    // Clear reset token
    localStorage.removeItem(`reset_token_${email.toLowerCase().trim()}`);

    alert('Password reimpostata con successo. Ora puoi accedere con la tua nuova password.');
    return true;
  }

  return false;
}

function registerUser(username, password, email) {
  // Normalize email
  email = email.toLowerCase().trim();

  // Validate input
  if (!username || username.length < AUTH_SETTINGS.MIN_USERNAME_LENGTH || 
      username.length > AUTH_SETTINGS.MAX_USERNAME_LENGTH) {
    alert(`Il nome utente deve essere compreso tra ${AUTH_SETTINGS.MIN_USERNAME_LENGTH} e ${AUTH_SETTINGS.MAX_USERNAME_LENGTH} caratteri`);
    return false;
  }

  if (!password || password.length < AUTH_SETTINGS.MIN_PASSWORD_LENGTH || 
      password.length > AUTH_SETTINGS.MAX_PASSWORD_LENGTH) {
    alert(`La password deve essere compresa tra ${AUTH_SETTINGS.MIN_PASSWORD_LENGTH} e ${AUTH_SETTINGS.MAX_PASSWORD_LENGTH} caratteri`);
    return false;
  }

  // Validate email format
  if (!validateEmail(email)) {
    alert('Inserisci un indirizzo email valido.');
    return false;
  }

  // Check email uniqueness BEFORE creating the account
  const normalizedEmail = email.toLowerCase().trim();
  const existingUserKey = findUserByEmail(normalizedEmail);
  
  if (existingUserKey) {
    alert("Un account con questa email è già registrato. Utilizza un'altra email.");
    return false;
  }

  try {
    // Create user profile object with a unique key
    const userStorageKey = `${AUTH_SETTINGS.STORAGE_KEY}_${Date.now()}`;
    const userProfile = {
      username: username,
      password: password, // Store password (in a real app, this would be hashed)
      email: email, // Store normalized email
      profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0095f6&color=fff`,
      fullName: username, 
      bio: "New to Earn Challenge", 
      joinDate: new Date().toISOString(),
      challengesCreated: 0,
      challengesParticipated: 0,
      challengesWon: 0,
      participatedChallenges: [], 
      wonChallenges: [] 
    };

    // Store user profile in localStorage with a unique key
    localStorage.setItem(userStorageKey, JSON.stringify(userProfile));
    
    // Set as current user
    localStorage.setItem('currentUser', JSON.stringify(userProfile));
    
    console.log('Utente registrato con successo:', userProfile);
    return userProfile;
  } catch (error) {
    console.error('Errore durante la registrazione dell\'utente:', error);
    alert('Si è verificato un errore durante la registrazione. Riprova più tardi.');
    return false;
  }
}

function loginUser(username, password) {
  // Normalize input (lowercase and trim)
  const normalizedInput = username.toLowerCase().trim();

  // Find user by iterating through all stored user profiles
  const userKeys = Object.keys(localStorage)
    .filter(key => key.startsWith(AUTH_SETTINGS.STORAGE_KEY + '_'));

  for (const key of userKeys) {
    const userProfile = JSON.parse(localStorage.getItem(key));
    
    if ((userProfile.username.toLowerCase().trim() === normalizedInput || 
        userProfile.email.toLowerCase().trim() === normalizedInput) && 
        userProfile.password === password) {
      // Password match, return user profile
      localStorage.setItem('currentUser', JSON.stringify(userProfile));
      return userProfile;
    }
  }
  
  return null;
}

function getCurrentUser() {
  // Check if we have a currentUser in localStorage
  const currentUserData = localStorage.getItem('currentUser');
  if (currentUserData) {
    return JSON.parse(currentUserData);
  }
  
  return null;
}

function updateUserProfile(updates) {
  const currentUserData = localStorage.getItem('currentUser');
  if (currentUserData) {
    const userProfile = JSON.parse(currentUserData);
    
    // Merge updates
    const updatedProfile = {
      ...userProfile,
      ...updates
    };

    // Update in both places: the user storage and currentUser
    const userKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(AUTH_SETTINGS.STORAGE_KEY + '_'));

    for (const key of userKeys) {
      const storedProfile = JSON.parse(localStorage.getItem(key));
      if (storedProfile.username === userProfile.username) {
        localStorage.setItem(key, JSON.stringify(updatedProfile));
        break;
      }
    }

    // Update current user
    localStorage.setItem('currentUser', JSON.stringify(updatedProfile));
    return updatedProfile;
  }
  return null;
}

function isUserLoggedIn() {
  return localStorage.getItem('currentUser') !== null;
}

function uploadProfilePicture(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const profilePic = event.target.result;
      const updatedProfile = updateUserProfile({ profilePic });
      resolve(updatedProfile);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function logoutUser() {
  // Remove current user from localStorage
  localStorage.removeItem('currentUser');
  
  // Clear any session-related data
  sessionStorage.clear();
  
  // Reset application state (if possible)
  if (window.resetAppState) {
    window.resetAppState();
  }
  
  // Show login section
  const loginSection = document.getElementById('login-section');
  if (loginSection) {
    loginSection.classList.remove('hidden');
  }
}

// Aggiungo la gestione degli eventi per il form di registrazione
document.addEventListener('DOMContentLoaded', () => {
  // Gestione del form di login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;

      if (!username || !password) {
        alert('Per favore, compila tutti i campi');
        return;
      }

      try {
        const user = await loginUser(username, password);
        if (user) {
          alert('Login effettuato con successo!');
          showSection('feed-section');
        } else {
          alert('Username o password non validi');
        }
      } catch (error) {
        console.error('Errore durante il login:', error);
        alert('Si è verificato un errore durante il login. Riprova più tardi.');
      }
    });
  }

  // Gestione del form di registrazione
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;

      // Validazione base
      if (!username || !email || !password || !confirmPassword) {
        alert('Per favore, compila tutti i campi');
        return;
      }

      if (password !== confirmPassword) {
        alert('Le password non coincidono');
        return;
      }

      if (password.length < 8) {
        alert('La password deve essere di almeno 8 caratteri');
        return;
      }

      try {
        const success = await registerUser(username, password, email);
        if (success) {
          alert('Account creato con successo! Ora puoi effettuare il login.');
          showSection('login-section');
        }
      } catch (error) {
        console.error('Errore durante la registrazione:', error);
        alert('Si è verificato un errore durante la registrazione. Riprova più tardi.');
      }
    });
  }

  // Gestione del form di recupero password
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('reset-email').value;
      if (!email || !validateEmail(email)) {
        alert('Inserisci un indirizzo email valido');
        return;
      }

      try {
        const success = await initiatePasswordReset(email);
        if (success) {
          showSection('login-section');
        }
      } catch (error) {
        console.error('Errore durante il recupero password:', error);
        alert('Si è verificato un errore durante il recupero della password. Riprova più tardi.');
      }
    });
  }

  // Gestione del form di reset password
  const resetPasswordForm = document.getElementById('reset-password-form');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const newPassword = document.getElementById('new-password').value;
      const confirmNewPassword = document.getElementById('confirm-new-password').value;
      const token = document.getElementById('reset-token-input').value;
      const email = document.getElementById('reset-email-input').value;

      if (!newPassword || !confirmNewPassword) {
        alert('Per favore, compila tutti i campi');
        return;
      }

      if (newPassword !== confirmNewPassword) {
        alert('Le password non coincidono');
        return;
      }

      if (newPassword.length < 8) {
        alert('La password deve essere di almeno 8 caratteri');
        return;
      }

      try {
        const success = await resetPassword(email, newPassword, token);
        if (success) {
          showSection('login-section');
        }
      } catch (error) {
        console.error('Errore durante il reset della password:', error);
        alert('Si è verificato un errore durante il reset della password. Riprova più tardi.');
      }
    });
  }
});

export { 
  registerUser, 
  loginUser, 
  logoutUser, 
  isUserLoggedIn, 
  getCurrentUser,
  updateUserProfile,
  uploadProfilePicture,
  initiatePasswordReset,
  resetPassword,
  isEmailUnique 
};

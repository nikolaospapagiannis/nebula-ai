/**
 * Chrome Extension Popup Script
 * Handles UI interactions and communication with background script
 */

// Logger utility for production-safe logging
const Logger = {
  log: (message, data) => {
    if (!('update_url' in chrome.runtime.getManifest())) {
      console.log(`[Fireflies] ${message}`, data || '');
    }
  },
  error: (message, error) => {
    if (!('update_url' in chrome.runtime.getManifest())) {
      console.error(`[Fireflies Error] ${message}`, error);
    }
  },
  analytics: (eventName, eventData) => {
    // Send analytics without PII
    chrome.runtime.sendMessage({
      action: 'analytics-event',
      event: eventName,
      data: eventData
    });
  }
};

// State
let isAuthenticated = false;
let currentMeeting = null;
let recordingStatus = 'idle';
let settings = {
  autoRecord: true,
  notifyOnStart: true,
  saveToDrive: false
};

// DOM Elements
const elements = {
  status: document.getElementById('status'),
  loginView: document.getElementById('login-view'),
  mainView: document.getElementById('main-view'),
  loginForm: document.getElementById('login-form'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  meetingCard: document.getElementById('meeting-card'),
  meetingTitle: document.getElementById('meeting-title'),
  meetingDuration: document.getElementById('meeting-duration'),
  meetingPlatformIcon: document.getElementById('meeting-platform-icon'),
  startRecording: document.getElementById('start-recording'),
  stopRecording: document.getElementById('stop-recording'),
  autoRecordToggle: document.getElementById('auto-record-toggle'),
  notificationsToggle: document.getElementById('notifications-toggle'),
  cloudSaveToggle: document.getElementById('cloud-save-toggle'),
  meetingsCount: document.getElementById('meetings-count'),
  hoursRecorded: document.getElementById('hours-recorded'),
  transcriptsCount: document.getElementById('transcripts-count'),
  actionItems: document.getElementById('action-items'),
  openDashboard: document.getElementById('open-dashboard'),
  viewSettings: document.getElementById('view-settings'),
  logout: document.getElementById('logout'),
  signupLink: document.getElementById('signup-link'),
  helpLink: document.getElementById('help-link'),
  privacyLink: document.getElementById('privacy-link'),
  termsLink: document.getElementById('terms-link')
};

// Initialize popup
async function initialize() {
  Logger.log('Initializing popup');
  
  // Load settings
  await loadSettings();
  
  // Check authentication status
  await checkAuthStatus();
  
  // Get current status from background
  await updateStatus();
  
  // Setup event listeners
  setupEventListeners();
  
  // Start update interval
  setInterval(updateStatus, 1000);
}

// Load settings from storage
async function loadSettings() {
  chrome.storage.sync.get(['autoRecord', 'notifyOnStart', 'saveToDrive'], (result) => {
    settings = {
      autoRecord: result.autoRecord ?? true,
      notifyOnStart: result.notifyOnStart ?? true,
      saveToDrive: result.saveToDrive ?? false
    };
    
    // Update UI
    updateToggle(elements.autoRecordToggle, settings.autoRecord);
    updateToggle(elements.notificationsToggle, settings.notifyOnStart);
    updateToggle(elements.cloudSaveToggle, settings.saveToDrive);
  });
}

// Check authentication status
async function checkAuthStatus() {
  chrome.storage.local.get(['authToken', 'user'], (result) => {
    isAuthenticated = !!result.authToken;
    
    if (isAuthenticated) {
      showMainView();
      if (result.user) {
        // Update UI with user info if needed
      }
    } else {
      showLoginView();
    }
  });
}

// Update status from background
async function updateStatus() {
  chrome.runtime.sendMessage({ action: 'get-status' }, (response) => {
    if (response) {
      isAuthenticated = response.isAuthenticated;
      recordingStatus = response.recordingStatus;
      currentMeeting = response.currentMeeting;
      
      updateUI();
    }
  });
  
  // Get current tab to check if it's a meeting
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      checkIfMeetingTab(tabs[0]);
    }
  });
}

// Check if current tab is a meeting
function checkIfMeetingTab(tab) {
  const meetingPatterns = [
    /https:\/\/meet\.google\.com\/.+/,
    /https:\/\/.*\.zoom\.us\/.+/,
    /https:\/\/teams\.microsoft\.com\/.+/
  ];
  
  const isMeeting = meetingPatterns.some(pattern => pattern.test(tab.url));
  
  if (isMeeting && currentMeeting) {
    elements.meetingCard.classList.remove('hidden');
    elements.meetingTitle.textContent = tab.title || 'Meeting in progress';
    
    // Update platform icon
    if (tab.url.includes('google.com')) {
      elements.meetingPlatformIcon.textContent = '🎬';
    } else if (tab.url.includes('zoom.us')) {
      elements.meetingPlatformIcon.textContent = '🎥';
    } else if (tab.url.includes('teams.microsoft.com')) {
      elements.meetingPlatformIcon.textContent = '📹';
    }
  } else if (!currentMeeting) {
    elements.meetingCard.classList.add('hidden');
  }
}

// Update UI based on state
function updateUI() {
  // Update status badge
  if (isAuthenticated) {
    if (recordingStatus === 'recording') {
      elements.status.textContent = 'Recording';
      elements.status.className = 'status recording';
      elements.startRecording.classList.add('hidden');
      elements.stopRecording.classList.remove('hidden');
    } else if (currentMeeting) {
      elements.status.textContent = 'In Meeting';
      elements.status.className = 'status connected';
      elements.startRecording.classList.remove('hidden');
      elements.stopRecording.classList.add('hidden');
    } else {
      elements.status.textContent = 'Connected';
      elements.status.className = 'status connected';
    }
  } else {
    elements.status.textContent = 'Disconnected';
    elements.status.className = 'status';
  }
  
  // Update meeting duration if recording
  if (recordingStatus === 'recording' && currentMeeting) {
    const startTime = new Date(currentMeeting.startTime);
    const duration = Date.now() - startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    elements.meetingDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Update stats (mock data for demo)
  updateStats();
}

// Update statistics - REAL API calls
async function updateStats() {
  try {
    const { authToken } = await chrome.storage.local.get(['authToken']);
    if (!authToken) {
      elements.meetingsCount.textContent = '0';
      elements.hoursRecorded.textContent = '0h';
      elements.transcriptsCount.textContent = '0';
      elements.actionItems.textContent = '0';
      return;
    }

    const response = await fetch('http://localhost:3001/api/user/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const stats = await response.json();

    elements.meetingsCount.textContent = stats.meetingsCount?.toString() || '0';
    elements.hoursRecorded.textContent = stats.hoursRecorded ? `${stats.hoursRecorded.toFixed(1)}h` : '0h';
    elements.transcriptsCount.textContent = stats.transcriptsCount?.toString() || '0';
    elements.actionItems.textContent = stats.actionItemsCount?.toString() || '0';

    chrome.storage.local.set({ cachedStats: stats });
  } catch (error) {
    Logger.error('Failed to fetch stats', error);
    chrome.storage.local.get(['cachedStats'], (result) => {
      if (result.cachedStats) {
        elements.meetingsCount.textContent = result.cachedStats.meetingsCount || '0';
        elements.hoursRecorded.textContent = result.cachedStats.hoursRecorded || '0h';
        elements.transcriptsCount.textContent = result.cachedStats.transcriptsCount || '0';
        elements.actionItems.textContent = result.cachedStats.actionItemsCount || '0';
      }
    });
  }
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  elements.loginForm.addEventListener('submit', handleLogin);
  
  // Recording controls
  elements.startRecording.addEventListener('click', handleStartRecording);
  elements.stopRecording.addEventListener('click', handleStopRecording);
  
  // Settings toggles
  elements.autoRecordToggle.addEventListener('click', () => {
    settings.autoRecord = !settings.autoRecord;
    updateToggle(elements.autoRecordToggle, settings.autoRecord);
    saveSetting('autoRecord', settings.autoRecord);
  });
  
  elements.notificationsToggle.addEventListener('click', () => {
    settings.notifyOnStart = !settings.notifyOnStart;
    updateToggle(elements.notificationsToggle, settings.notifyOnStart);
    saveSetting('notifyOnStart', settings.notifyOnStart);
  });
  
  elements.cloudSaveToggle.addEventListener('click', () => {
    settings.saveToDrive = !settings.saveToDrive;
    updateToggle(elements.cloudSaveToggle, settings.saveToDrive);
    saveSetting('saveToDrive', settings.saveToDrive);
  });
  
  // Quick actions
  elements.openDashboard.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3003/dashboard' });
  });
  
  elements.viewSettings.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3003/settings' });
  });
  
  elements.logout.addEventListener('click', handleLogout);
  
  // Links
  elements.signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'http://localhost:3003/register' });
  });
  
  elements.helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'http://localhost:3003/help' });
  });
  
  elements.privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'http://localhost:3003/privacy' });
  });
  
  elements.termsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'http://localhost:3003/terms' });
  });
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = elements.email.value;
  const password = elements.password.value;
  
  // Disable form
  elements.loginForm.querySelectorAll('input, button').forEach(el => {
    el.disabled = true;
  });
  
  // Send login request to background
  chrome.runtime.sendMessage({
    action: 'authenticate',
    credentials: { email, password }
  }, (response) => {
    if (response && response.success) {
      isAuthenticated = true;
      showMainView();
      updateUI();
    } else {
      alert('Login failed. Please check your credentials.');
      // Re-enable form
      elements.loginForm.querySelectorAll('input, button').forEach(el => {
        el.disabled = false;
      });
    }
  });
}

// Handle logout
async function handleLogout() {
  chrome.storage.local.remove(['authToken', 'user'], () => {
    isAuthenticated = false;
    showLoginView();
    updateUI();
  });
}

// Handle start recording
async function handleStartRecording() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'start-recording' }, (response) => {
        if (response && response.success) {
          recordingStatus = 'recording';
          updateUI();
        }
      });
    }
  });
}

// Handle stop recording
async function handleStopRecording() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'stop-recording' }, (response) => {
        if (response && response.success) {
          recordingStatus = 'idle';
          updateUI();
        }
      });
    }
  });
}

// Update toggle UI
function updateToggle(toggle, isActive) {
  if (isActive) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
}

// Save setting to storage
function saveSetting(key, value) {
  chrome.storage.sync.set({ [key]: value });
}

// Show login view
function showLoginView() {
  elements.loginView.classList.remove('hidden');
  elements.mainView.classList.add('hidden');
}

// Show main view
function showMainView() {
  elements.loginView.classList.add('hidden');
  elements.mainView.classList.remove('hidden');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);

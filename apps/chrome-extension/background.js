/**
 * Chrome Extension Background Service Worker
 * Manages extension lifecycle, API communication, and meeting detection
 */

// Import logger utility
importScripts('utils/logger.js');

// API Configuration
const API_URL = 'http://localhost:4000/api';
const WS_URL = 'ws://localhost:5003';

// Extension state
let authToken = null;
let currentMeeting = null;
let recordingStatus = 'idle'; // idle, recording, paused
let websocket = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  Logger.log('Fireflies Extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    autoRecord: true,
    notifyOnStart: true,
    transcriptionLanguage: 'en-US',
    saveToDrive: false
  });

  // Create context menu items
  chrome.contextMenus.create({
    id: 'start-recording',
    title: 'Start Recording',
    contexts: ['page'],
    documentUrlPatterns: [
      'https://meet.google.com/*',
      'https://*.zoom.us/*',
      'https://teams.microsoft.com/*'
    ]
  });

  chrome.contextMenus.create({
    id: 'stop-recording',
    title: 'Stop Recording',
    contexts: ['page'],
    documentUrlPatterns: [
      'https://meet.google.com/*',
      'https://*.zoom.us/*',
      'https://teams.microsoft.com/*'
    ]
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // No logging - messages may contain PII

  switch (request.action) {
    case 'meeting-detected':
      handleMeetingDetected(request.data, sender.tab);
      sendResponse({ success: true });
      break;

    case 'meeting-ended':
      handleMeetingEnded(request.data, sender.tab);
      sendResponse({ success: true });
      break;

    case 'start-recording':
      startRecording(request.data, sender.tab);
      sendResponse({ success: true });
      break;

    case 'stop-recording':
      stopRecording();
      sendResponse({ success: true });
      break;

    case 'get-status':
      sendResponse({
        isAuthenticated: !!authToken,
        recordingStatus,
        currentMeeting
      });
      break;

    case 'authenticate':
      authenticateUser(request.credentials)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Will respond asynchronously

    case 'capture-audio':
      captureAudioStream(sender.tab.id)
        .then(stream => sendResponse({ success: true, stream }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'transcript-segment':
      handleTranscriptSegment(request.data);
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Handle meeting detection
async function handleMeetingDetected(meetingData, tab) {
  Logger.analytics('meeting_detected', { platform: meetingData.platform });
  
  currentMeeting = {
    ...meetingData,
    tabId: tab.id,
    startTime: new Date().toISOString(),
    url: tab.url,
    title: tab.title
  };

  // Get auto-record setting
  const settings = await chrome.storage.sync.get(['autoRecord', 'notifyOnStart']);
  
  if (settings.autoRecord) {
    await startRecording(meetingData, tab);
  }

  if (settings.notifyOnStart) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'Meeting Detected',
      message: `${meetingData.platform} meeting detected. ${settings.autoRecord ? 'Recording started.' : 'Click to start recording.'}`
    });
  }

  // Update extension badge
  chrome.action.setBadgeText({ text: 'REC', tabId: tab.id });
  chrome.action.setBadgeBackgroundColor({ color: '#ff0000', tabId: tab.id });
}

// Handle meeting end
async function handleMeetingEnded(data, tab) {
  Logger.analytics('meeting_ended', { hasMeeting: !!currentMeeting });
  
  if (recordingStatus === 'recording') {
    await stopRecording();
  }

  // Clear badge
  chrome.action.setBadgeText({ text: '', tabId: tab.id });

  // Send meeting data to server
  if (currentMeeting && authToken) {
    try {
      await saveMeetingData(currentMeeting);
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'Meeting Saved',
        message: 'Your meeting has been saved and is being processed.'
      });
    } catch (error) {
      Logger.error('Failed to save meeting', error);
    }
  }

  currentMeeting = null;
}

// Start recording
async function startRecording(meetingData, tab) {
  Logger.analytics('recording_started', { platform: meetingData?.platform });
  
  recordingStatus = 'recording';
  
  // Inject recording script
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['scripts/recorder.js']
  });

  // Connect to WebSocket for real-time transcription
  connectWebSocket();

  // Send start recording message to content script
  chrome.tabs.sendMessage(tab.id, {
    action: 'start-recording',
    config: {
      sampleRate: 16000,
      channels: 1,
      language: 'en-US'
    }
  });

  // Update UI
  chrome.action.setBadgeText({ text: 'REC', tabId: tab.id });
  chrome.action.setBadgeBackgroundColor({ color: '#ff0000', tabId: tab.id });
}

// Stop recording
async function stopRecording() {
  Logger.analytics('recording_stopped', {});
  
  recordingStatus = 'idle';
  
  if (currentMeeting) {
    // Send stop message to content script
    chrome.tabs.sendMessage(currentMeeting.tabId, {
      action: 'stop-recording'
    });
  }

  // Disconnect WebSocket
  if (websocket) {
    websocket.close();
    websocket = null;
  }

  // Clear badge
  if (currentMeeting?.tabId) {
    chrome.action.setBadgeText({ text: '', tabId: currentMeeting.tabId });
  }
}

// Connect to WebSocket for real-time features
function connectWebSocket() {
  if (websocket) return;

  websocket = new WebSocket(WS_URL);

  websocket.onopen = () => {
    Logger.log('WebSocket connected');
    
    // Authenticate WebSocket connection
    if (authToken) {
      websocket.send(JSON.stringify({
        type: 'auth',
        token: authToken
      }));
    }

    // Join meeting room
    if (currentMeeting) {
      websocket.send(JSON.stringify({
        type: 'join-meeting',
        meetingId: currentMeeting.id
      }));
    }
  };

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleWebSocketMessage(message);
  };

  websocket.onerror = (error) => {
    Logger.error('WebSocket error', error);
  };

  websocket.onclose = () => {
    Logger.log('WebSocket disconnected');
    websocket = null;
  };
}

// Handle WebSocket messages
function handleWebSocketMessage(message) {
  // No logging - messages may contain PII

  switch (message.type) {
    case 'transcript-update':
      // Forward to content script
      if (currentMeeting) {
        chrome.tabs.sendMessage(currentMeeting.tabId, {
          action: 'transcript-update',
          data: message.data
        });
      }
      break;

    case 'analysis-update':
      // Store analysis data
      if (currentMeeting) {
        currentMeeting.analysis = message.data;
      }
      break;

    case 'recording-complete':
      handleRecordingComplete(message.data);
      break;
  }
}

// Handle transcript segments
function handleTranscriptSegment(segment) {
  // No logging - transcript segments contain PII

  // Send to WebSocket
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      type: 'transcript-segment',
      data: segment
    }));
  }

  // Store locally
  if (currentMeeting) {
    if (!currentMeeting.transcripts) {
      currentMeeting.transcripts = [];
    }
    currentMeeting.transcripts.push(segment);
  }
}

// Authenticate user
async function authenticateUser(credentials) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    authToken = data.accessToken;

    // Store token
    await chrome.storage.local.set({ authToken });

    return { success: true, user: data.user };
  } catch (error) {
    Logger.error('Authentication error', error);
    return { success: false, error: error.message };
  }
}

// Save meeting data to server
async function saveMeetingData(meeting) {
  if (!authToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/meetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      title: meeting.title || 'Untitled Meeting',
      platform: meeting.platform,
      url: meeting.url,
      startTime: meeting.startTime,
      endTime: new Date().toISOString(),
      duration: Date.now() - new Date(meeting.startTime).getTime(),
      participants: meeting.participants || [],
      transcripts: meeting.transcripts || [],
      analysis: meeting.analysis || {}
    })
  });

  if (!response.ok) {
    throw new Error('Failed to save meeting');
  }

  return response.json();
}

// Handle recording complete
async function handleRecordingComplete(data) {
  Logger.analytics('recording_complete', { hasData: !!data });

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: 'Recording Complete',
    message: 'Your meeting recording has been processed successfully.',
    buttons: [
      { title: 'View Meeting' },
      { title: 'Download Transcript' }
    ]
  });
}

// Capture audio stream from tab
async function captureAudioStream(tabId) {
  try {
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tabId
    });

    return streamId;
  } catch (error) {
    Logger.error('Failed to capture audio', error);
    throw error;
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'start-recording':
      chrome.tabs.sendMessage(tab.id, { action: 'start-recording' });
      break;
    case 'stop-recording':
      chrome.tabs.sendMessage(tab.id, { action: 'stop-recording' });
      break;
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Toggle recording
  if (recordingStatus === 'recording') {
    stopRecording();
  } else {
    // Send message to content script to check for meeting
    chrome.tabs.sendMessage(tab.id, { action: 'check-meeting' });
  }
});

// Load auth token on startup
chrome.storage.local.get(['authToken'], (result) => {
  if (result.authToken) {
    authToken = result.authToken;
    Logger.log('Auth token loaded');
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Check if this is a meeting URL
    const meetingPatterns = [
      /https:\/\/meet\.google\.com\/.+/,
      /https:\/\/.*\.zoom\.us\/.+/,
      /https:\/\/teams\.microsoft\.com\/.+/
    ];

    const isMeetingUrl = meetingPatterns.some(pattern => pattern.test(tab.url));
    
    if (isMeetingUrl) {
      // Inject content script if needed
      chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
        if (!response) {
          // Content script not loaded, inject it
          const platform = tab.url.includes('google.com') ? 'google-meet' :
                          tab.url.includes('zoom.us') ? 'zoom' :
                          tab.url.includes('teams.microsoft.com') ? 'teams' : null;
          
          if (platform) {
            chrome.scripting.executeScript({
              target: { tabId },
              files: [`content-scripts/${platform}.js`]
            });
          }
        }
      });
    }
  }
});

// Clean up on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  if (currentMeeting && currentMeeting.tabId === tabId) {
    handleMeetingEnded({}, { id: tabId });
  }
});

Logger.log('Background service worker initialized');

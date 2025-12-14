# Nebula AI Meeting Recorder Chrome Extension

## 🎯 Overview

The Nebula AI Chrome Extension automatically detects, records, and transcribes your web meetings from Google Meet, Zoom, Microsoft Teams, and other platforms. It provides real-time transcription, speaker identification, and seamless integration with the Nebula AI platform.

## ✨ Features

- **Auto-Detection**: Automatically detects when you join a meeting
- **One-Click Recording**: Start/stop recording with a single click
- **Real-time Transcription**: Live captions and transcription during meetings
- **Speaker Identification**: Identifies and labels different speakers
- **Multi-Platform Support**: Works with Google Meet, Zoom, Teams, and more
- **Cloud Sync**: Automatically saves recordings and transcripts to the cloud
- **Smart Notifications**: Get notified when meetings start or important moments occur
- **Privacy Controls**: Full control over what gets recorded and when

## 📦 Installation

### From Source (Development)

1. Clone the repository:
```bash
git clone https://github.com/your-org/nebula-ai.git
cd nebula-ai/apps/chrome-extension
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `apps/chrome-extension` directory

### From Chrome Web Store

(Coming soon - extension pending review)

## 🚀 Usage

### Getting Started

1. **Sign In**: Click the extension icon and sign in with your Nebula AI account
2. **Configure Settings**:
   - Enable auto-record for automatic meeting detection
   - Choose notification preferences
   - Select cloud storage options

### Recording a Meeting

#### Automatic Recording
- Join any supported meeting platform
- The extension will detect the meeting and start recording automatically (if enabled)
- You'll see a recording indicator in the meeting interface

#### Manual Recording
1. Join your meeting
2. Click the Nebula AI extension icon
3. Click "Start Recording"
4. To stop, click the extension icon again and select "Stop Recording"

### Supported Platforms

| Platform | Auto-Detection | Recording | Transcription | Chat Capture |
|----------|---------------|-----------|---------------|--------------|
| Google Meet | ✅ | ✅ | ✅ | ✅ |
| Zoom Web | ✅ | ✅ | ✅ | ✅ |
| Microsoft Teams | ✅ | ✅ | ✅ | ✅ |
| Webex | ✅ | ✅ | ✅ | ⏳ |
| GoToMeeting | ✅ | ✅ | ✅ | ⏳ |
| Discord | ✅ | ✅ | ✅ | ✅ |

## 🔧 Configuration

### Settings

Access settings through the extension popup:

- **Auto-Record**: Automatically start recording when a meeting is detected
- **Notifications**: Show desktop notifications for meeting events
- **Save to Cloud**: Automatically upload recordings to cloud storage
- **Transcription Language**: Select primary language for transcription
- **Speaker Labels**: Enable speaker identification in transcripts

### Permissions

The extension requires the following permissions:

- **activeTab**: To detect and interact with meeting tabs
- **storage**: To save your preferences and settings
- **notifications**: To show meeting alerts
- **webRequest**: To capture meeting data
- **cookies**: For authentication with the Nebula AI platform

## 🛠️ Development

### Project Structure

```
apps/chrome-extension/
├── manifest.json           # Extension configuration
├── background.js          # Service worker for background tasks
├── popup.html            # Extension popup UI
├── popup.js             # Popup logic
├── content-scripts/     # Platform-specific content scripts
│   ├── google-meet.js
│   ├── zoom.js
│   └── teams.js
├── styles/             # CSS styles
│   └── overlay.css
├── icons/              # Extension icons
└── scripts/            # Utility scripts
    ├── recorder.js
    └── inject.js
```

### Development Commands

```bash
# Install dependencies
npm install

# Development build with watch
npm run dev

# Production build
npm run build

# Package extension for distribution
npm run package

# Clean build artifacts
npm run clean
```

### Testing

1. Load the extension in development mode
2. Navigate to a test meeting URL
3. Check the console for debug logs
4. Verify recording and transcription functionality

### API Integration

The extension communicates with the Nebula AI backend API:

- **Base URL**: `http://localhost:3001/api` (development)
- **WebSocket**: `ws://localhost:3002` (real-time features)
- **Authentication**: JWT tokens stored in Chrome storage

## 🔒 Privacy & Security

- **Local Processing**: Audio processing happens locally when possible
- **Encrypted Storage**: All credentials are encrypted
- **User Consent**: Recording only starts with explicit user action
- **Data Ownership**: Users maintain full ownership of their data
- **GDPR Compliant**: Follows data protection regulations

## 🐛 Troubleshooting

### Extension Not Detecting Meetings

1. Refresh the meeting page
2. Check if the platform is supported
3. Ensure you're signed in to the extension
4. Check browser console for errors

### Recording Not Starting

1. Check microphone permissions
2. Ensure no other recording software is active
3. Try manual recording instead of auto-record
4. Clear extension cache and reload

### Transcription Issues

1. Enable captions in the meeting platform
2. Check language settings
3. Ensure stable internet connection
4. Update to latest extension version

## 📝 Changelog

### Version 1.0.0 (2025-01-10)
- Initial release
- Support for Google Meet, Zoom, and Teams
- Real-time transcription
- Cloud sync functionality
- Auto-detection and recording
- Speaker identification

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://docs.nebula-ai.com](https://docs.nebula-ai.com)
- **Help Center**: [https://help.nebula-ai.com](https://help.nebula-ai.com)
- **Email**: support@nebula-ai.com
- **Discord**: [Join our community](https://discord.gg/nebula-ai)

## 🚦 Status

- **Version**: 1.0.0
- **Status**: Beta
- **Chrome Web Store**: Pending Review
- **Firefox Add-ons**: In Development
- **Edge Add-ons**: Planned

## 🎉 Acknowledgments

Built with:
- Chrome Extensions Manifest V3
- WebRTC for audio capture
- Socket.io for real-time features
- Web Audio API for processing

---

**Note**: Nebula AI is an open-source meeting transcription platform.

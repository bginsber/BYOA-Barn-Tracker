# Ben's Barn Tracker

A comprehensive barn and horse care management application with AI-powered features for tracking tasks, documenting activities through photos and voice, and getting intelligent care recommendations.

## Scope

- Add and track daily tasks completed at the barn
- Track habit completion with streak tracking
- View detailed history and calendar of completed tasks
- Document barn activities with photos and voice notes
- Get AI-powered insights from photos (calorie counting, blanket detection)
- Automatic transcription and analysis of voice notes
- Edit and delete tasks/entries

## Tech Stack

- React Native 0.76.6
- Expo 52
- TypeScript
- Firebase (Auth, Firestore, Storage)
- Google Gemini API (Vision & Text)
- OpenAI Whisper API (Audio Transcription)
- OpenWeatherMap API

## Core Features

- Add habits to different categories (i.e. grooming, feeding, medicine, etc.)
- Different habit frequency (i.e. daily, weekly, monthly, yearly)
- Be able to change the time of the task based on the weather
- Be able to have notifications for the tasks that can turn into an alarm

## AI-Powered Journal System

Document your barn activities with intelligent photo and voice entries:

### Photo Journal Entries
- **Take or upload photos** of your barn activities
- **AI Image Analysis** powered by Google Gemini Vision:
  - **Food/Meal Detection**: Automatically identify food items and estimate calories
  - **Horse Blanket Detection**: Detect if your horse is wearing a blanket and identify blanket type
  - **General Scene Analysis**: Identify animals, activities, and barn conditions
  - **Confidence Scoring**: Get reliability scores for AI analysis

### Voice Journal Entries
- **Record voice notes** about your barn activities
- **Automatic Transcription** using OpenAI Whisper API
- **Smart Content Analysis**:
  - **Task Detection**: Automatically identify completed or mentioned tasks
  - **Keyword Extraction**: Highlight important topics and themes
  - **Entity Recognition**: Detect mentions of horses, people, and locations
- **Task Integration**: Link voice entries to your to-do list

### Timeline View
- Chronological display of all journal entries
- Filter by type (photo/audio), category, or date
- Rich previews with AI analysis summaries
- Quick access to related tasks

## Smart Blanketing System

Meet Sage, your AI-powered barn manager assistant:
- Intelligent blanketing recommendations based on:
  - Real-time weather conditions
  - Individual horse profiles
  - Coat condition and clipping status
  - Age and health considerations
- Natural language explanations
- Weather-aware scheduling
- Smart notifications

## Advanced Features

- Calendar integration
- Photo documentation for tasks
- Export/import functionality
- Multi-user collaboration
- Weather integration API

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for macOS) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BYOA-Barn-Tracker.git
   cd BYOA-Barn-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

   Required API Keys:
   - **Firebase**: Get from [Firebase Console](https://console.firebase.google.com/)
   - **Google Gemini**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **OpenAI**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **OpenWeatherMap**: Get from [OpenWeatherMap](https://openweathermap.org/api)

4. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Enable Storage
   - Add your config to `.env`

5. **Run the app**
   ```bash
   npm start
   ```

   Then:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Development Roadmap

### ✅ Completed
- Task management with categories and frequency
- Weather integration
- Sage AI assistant for blanketing
- Photo journal with AI analysis
- Voice journal with transcription
- Task completion tracking and streaks

### Next Up
- Enhanced task-journal integration
- Comprehensive horse profile management
- Advanced weather pattern analysis
- Offline mode support
- Push notifications
- Data export/backup

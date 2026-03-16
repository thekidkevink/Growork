# Growork - Professional Networking & Job Platform

Growork is a modern professional networking and job search platform built with React Native and Expo. It connects professionals, job seekers, and companies in a seamless mobile experience.

## Features

- **Job Listings**: Browse and filter job opportunities by industry
- **Professional Networking**: Connect with other professionals and companies
- **Content Feed**: Stay updated with industry news and professional content
- **Job Applications**: Apply to jobs directly through the app
- **Profile Management**: Create and manage your professional profile
- **Document Management**: Upload and manage CVs, cover letters, and certificates
- **Bookmarks**: Save jobs and content for later viewing
- **Company Profiles**: Companies can create profiles and post job opportunities
- **Live Comments**: Comment updates with automatic refresh

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/tuyoleni/growork.git
   cd growork
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npx expo start
   ```

### Running the App

The Expo development server provides options to run the app on:

- iOS Simulator
- Android Emulator
- Physical devices using Expo Go
- Web browser

## Real-Time Features

Growork includes live comments with automatic refresh. Users can see comments appear across all devices with regular updates.

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **State Management**: React Context + Custom Hooks
- **Navigation**: Expo Router
- **UI Components**: Custom themed components

## Project Structure

```
growork/
├── app/                    # Expo Router screens
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions and configurations
├── types/                 # TypeScript type definitions
├── constants/             # App constants and configurations
└── docs/                  # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

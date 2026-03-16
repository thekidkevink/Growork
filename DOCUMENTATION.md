<style>
body { font-size: 0.9em; }
h1 { font-size: 1.6em; }
h2 { font-size: 1.3em; }
h3 { font-size: 1.1em; }
</style>

#### Growork - Comprehensive Documentation

#### Overview

This document merges the high-level specification and the high-level file structure for the Growork application. It also includes the design reference in Figma.

- Specification content source: `SPECIFICATION.md`
- File structure content source: `FILE_STRUCTURE.md`
- Design reference: [Figma - Growork](https://www.figma.com/design/DvqWY3TRz37k3cJn0M5huW/growowk?m=auto&t=FgF9pZpBvRfJ5jQO-1)

#### 1. Application Overview

**Growork** is a modern professional networking and job search platform built with React Native and Expo. It connects professionals, job seekers, and companies in a seamless digital ecosystem.

#### 1.1 Core Purpose

- Professional Networking: Connect professionals and companies
- Job Discovery: Browse and apply to job opportunities
- Content Sharing: Share industry news and professional content
- Career Management: Manage professional profiles and documents
- Company Engagement: Follow and interact with companies

#### 1.2 Target Audience

- Job Seekers: Professionals looking for career opportunities
- Business Users: Companies posting jobs and managing applications
- Industry Professionals: Users sharing and consuming professional content

#### 2. Technical Architecture

#### 2.1 Technology Stack

- Frontend: React Native with Expo (v54.0.7)
- Backend: Supabase (PostgreSQL + Real-time)
- Authentication: Supabase Auth with JWT tokens
- Storage: Supabase Storage for files and documents
- State Management: React Context + Custom Hooks
- Navigation: Expo Router with file-based routing
- UI Framework: Custom themed components with design system
- Platform Support: iOS, Android, Web

#### 2.2 Architecture Patterns

- Component-Based Architecture: Modular, reusable UI components
- Hook-Based State Management: Custom hooks for data fetching and state
- Context API: Global state management for authentication and app data
- File-Based Routing: Expo Router for navigation structure
- Real-time Updates: Supabase real-time subscriptions for live data

#### 3. User Types & Permissions

#### 3.1 User Types

1. Regular Users (UserType.User)

   - Browse jobs and content
   - Apply to job postings
   - Create and manage profile
   - Bookmark content
   - Follow companies

2. Business Users (UserType.Business)
   - All regular user features
   - Create and manage company profiles
   - Post job opportunities
   - Manage job applications
   - Access business-specific features

#### 3.2 Permission System

- Role-based Access Control: Different features based on user type
- Protected Routes: Authentication-required screens
- Business Features: Company management and job posting capabilities

#### 4. Core Features & Functionality

#### 4.1 Authentication System

- Multi-step Registration: Email → Username → Verification → Success
- Login/Logout: Email and password authentication
- Session Management: Automatic token refresh and persistence
- Error Handling: Comprehensive auth error handling with user-friendly messages
- Profile Creation: Automatic profile creation on successful registration

#### 4.2 Home Feed

- Content Discovery: Mixed feed of jobs and news content
- Filtering System: Filter by content type (All, Jobs, News) and industry
- Real-time Updates: Live content updates with new post indicators
- Interactive Elements: Like, bookmark, comment, and apply functionality
- Infinite Scroll: Optimized performance with virtualization
- Pull-to-Refresh: Manual content refresh capability

#### 4.3 Job Management

- Job Posting: Business users can create job postings
- Job Discovery: Browse jobs with filtering and search
- Application System: Apply to jobs with document attachments
- Application Tracking: Monitor application status (Pending, Reviewed, Accepted, Rejected)
- Company Integration: Jobs linked to company profiles

#### 4.4 Content Management

- Post Creation: Create news articles and job postings
- Content Types: Support for both job postings and news articles
- Rich Media: Image support for posts
- Industry Categorization: Content organized by industry sectors
- Content Interaction: Like, comment, and bookmark functionality

#### 4.5 Search & Discovery

- Global Search: Search across jobs, news, and documents
- Advanced Filtering: Multiple filter criteria
- Industry-based Search: Filter by specific industries
- Real-time Results: Live search results with debouncing

#### 4.6 Profile Management

- User Profiles: Comprehensive professional profiles
- Profile Strength: Calculated profile completion metrics
- Document Management: Upload and manage CVs, cover letters, certificates
- Company Following: Follow companies of interest
- Company Management: Business users can manage multiple companies

#### 4.7 Bookmark System

- Content Saving: Save jobs and articles for later
- Category Filtering: Filter bookmarks by content type
- Persistent Storage: Bookmarks persist across sessions
- Quick Access: Easy access to saved content

#### 4.8 Company Features

- Company Profiles: Detailed company information and branding
- Company Following: Follow companies for updates
- Company Management: Business users can manage company profiles
- Company Posts: Companies can post job opportunities and news

#### 4.9 Real-time Features

- Live Comments: Real-time comment updates across devices
- Notification System: Push notifications for important updates
- Live Data Sync: Real-time data synchronization
- Offline Support: Basic offline functionality with sync on reconnect

#### 5. Data Models

#### 5.1 Core Entities

User Profile

```typescript
interface Profile {
  id: string;
  username: string;
  name: string;
  surname: string;
  avatar_url: string;
  bio: string;
  user_type: UserType;
  website: string;
  phone: string;
  location: string;
  profession: string;
  experience_years: number;
  education: string;
  skills: string[];
  created_at: string;
  updated_at: string;
}
```

Post/Content

```typescript
interface Post {
  id: string;
  user_id: string;
  type: PostType; // 'news' | 'job'
  title: string;
  content: string;
  image_url: string;
  industry: string;
  criteria: {
    company?: string;
    location?: string;
    salary?: string;
    jobType?: string;
    requirements?: string[];
    benefits?: string[];
    deadline?: string;
  };
  created_at: string;
  updated_at: string;
  is_sponsored: boolean;
}
```

Company

```typescript
interface Company {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website: string;
  industry: string;
  size: string;
  founded_year: number;
  location: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}
```

Job Application

```typescript
interface Application {
  id: string;
  user_id: string;
  post_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  documents: string[];
  created_at: string;
  updated_at: string;
}
```

#### 5.2 Enums

- PostType: News, Job
- UserType: User, Business
- ApplicationStatus: Pending, Reviewed, Accepted, Rejected
- DocumentType: CV, CoverLetter, Certificate, Other
- NotificationType: Post interactions, Application updates, Company updates

#### 6. Navigation Structure

#### 6.1 Main Navigation (Tab-based)

- Home: Main feed with content discovery
- Applications/Jobs: Job applications (business users) or job listings
- Search: Global search functionality
- Bookmarks: Saved content
- Profile: User profile and settings

#### 6.2 Authentication Flow

- Login: Email/password authentication
- Registration: Multi-step process (Email → Username → Verification → Success)
- Protected Routes: Automatic redirection based on authentication status

#### 6.3 Modal Screens

- Post Creation: Create new posts and job listings
- Job Application: Apply to jobs with document attachments
- Company Management: Manage company profiles
- Document Upload: Upload and manage professional documents

#### 7. User Interface & Design

#### 7.1 Design System

- Themed Components: Consistent theming across light/dark modes
- Color System: Comprehensive color palette with semantic naming
- Typography: Consistent text styling and hierarchy
- Spacing: Standardized spacing system
- Components: Reusable UI components with consistent behavior

#### 7.2 Key UI Features

- Animated Headers: Collapsible headers with smooth animations
- Bottom Sheets: Modal presentations for forms and details
- Skeleton Loading: Loading states for better UX
- Pull-to-Refresh: Standard refresh patterns
- Haptic Feedback: Tactile feedback for interactions
- Accessibility: Screen reader support and accessibility features

#### 7.3 Responsive Design

- Adaptive Layouts: Responsive to different screen sizes
- Platform-specific: iOS and Android native feel
- Web Support: Responsive web interface

#### 8. Performance & Optimization

#### 8.1 Performance Features

- Virtualization: Efficient list rendering for large datasets
- Image Optimization: Optimized image loading and caching
- Lazy Loading: On-demand content loading
- Memory Management: Efficient memory usage patterns
- Network Optimization: Request batching and caching

#### 8.2 Data Management

- Caching Strategy: Intelligent data caching
- Offline Support: Basic offline functionality
- Real-time Updates: Efficient real-time data synchronization
- Error Handling: Comprehensive error handling and recovery

#### 9. Security & Privacy

#### 9.1 Authentication Security

- JWT Tokens: Secure token-based authentication
- Session Management: Automatic token refresh
- Secure Storage: Encrypted local storage
- Error Handling: Secure error handling without information leakage

#### 9.2 Data Protection

- Input Validation: Comprehensive input sanitization
- SQL Injection Prevention: Parameterized queries
- XSS Protection: Content sanitization
- Privacy Controls: User data privacy controls

#### 10. Integration & APIs

#### 10.1 Backend Integration

- Supabase Integration: Full backend-as-a-service integration
- Real-time Subscriptions: Live data updates
- File Storage: Document and image storage
- Database: PostgreSQL with real-time capabilities

#### 10.2 External Services

- Push Notifications: Expo notifications service
- Email Service: Email verification and notifications
- File Upload: Document and image upload services
- Analytics: User behavior tracking (if implemented)

#### 11. Development & Deployment

#### 11.1 Development Environment

- Expo Development Build: Custom development client
- Hot Reloading: Fast development iteration
- TypeScript: Full type safety
- ESLint: Code quality enforcement

#### 11.2 Build & Deployment

- EAS Build: Expo Application Services for builds
- Multi-platform: iOS, Android, and Web builds
- Environment Configuration: Secure environment variable management
- Update System: Over-the-air updates capability

#### 12. Future Considerations

#### 12.1 Scalability

- Database Optimization: Query optimization for large datasets
- Caching Strategy: Advanced caching mechanisms
- CDN Integration: Content delivery optimization
- Microservices: Potential backend service separation

#### 12.2 Feature Extensions

- Advanced Search: AI-powered search capabilities
- Recommendation Engine: Personalized content recommendations
- Analytics Dashboard: Business intelligence features
- API Access: Third-party integration capabilities

#### 13. Technical Requirements

#### 13.1 System Requirements

- React Native: 0.81.4+
- Expo SDK: 54.0.7+
- Node.js: 14+ for development
- iOS: 11.0+ for deployment
- Android: API level 21+ for deployment

#### 13.2 Dependencies

- Core: React Native, Expo, TypeScript
- Navigation: Expo Router, React Navigation
- UI: Custom components, React Native Reanimated
- Backend: Supabase client, AsyncStorage
- Utilities: Various Expo modules for device features

#### 14. High-Level File Structure

Project Root

```
growork/
├── app/                          # Expo Router application screens
├── assets/                       # Static assets (images, fonts, sounds)
├── components/                   # Reusable UI components
├── constants/                    # App constants and configuration
├── dataset/                      # Static data and configurations
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── utils/                        # Utility functions and services
├── ios/                         # iOS-specific files
├── node_modules/                 # Dependencies
├── package.json                 # Project dependencies and scripts
├── app.json                     # Expo configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # ESLint configuration
├── babel.config.js              # Babel configuration
├── eas.json                     # EAS Build configuration
└── README.md                    # Project documentation
```

App Screens (`/app/`)

```
app/
├── _layout.tsx                   # Root layout with providers
├── +not-found.tsx               # 404 error screen
├── notifications.tsx             # Notifications screen
├── settings.tsx                 # App settings screen
├── (tabs)/                      # Main tab navigation
│   ├── _layout.tsx              # Tab layout configuration
│   ├── index.tsx                # Home feed screen
│   ├── applications.tsx         # Job applications screen
│   ├── bookmarks.tsx            # Saved content screen
│   ├── profile.tsx              # User profile screen
│   └── search.tsx               # Search screen
├── auth/                        # Authentication flow
│   ├── _layout.tsx              # Auth layout
│   ├── login.tsx                # Login screen
│   ├── email.tsx                # Email registration
│   ├── username.tsx             # Username setup
│   ├── verify.tsx               # Email verification
│   └── success.tsx              # Registration success
├── application/                 # Job application details
│   └── [id].tsx                 # Individual application view
├── company/                     # Company profiles
│   └── [id].tsx                 # Individual company view
├── post/                        # Post details
│   ├── _layout.tsx             # Post layout
│   └── [id].tsx                 # Individual post view
├── profile/                     # Profile management
│   ├── companies.tsx            # Company management
│   ├── CompanyManagement.tsx    # Company management component
│   ├── documents.tsx            # Document management
│   ├── edit-profile.tsx         # Profile editing
│   ├── ProfileScreen.tsx        # Profile display
│   └── UserProfileEdit.tsx      # User profile editing
└── search/                      # Search functionality
    ├── layout.tsx               # Search layout
    ├── SearchClient.tsx         # Search client component
    └── components/              # Search-specific components
        ├── [4 files]            # Search UI components
```

Components (`/components/`)

```
components/
├── AuthErrorHandler.tsx          # Authentication error handling
├── ErrorBoundary.tsx            # Error boundary component
├── GlobalBottomSheet.tsx        # Global bottom sheet
├── HapticTab.tsx                # Haptic feedback tab
├── LoadingSpinner.tsx            # Loading indicator
├── NetworkStatusBanner.tsx       # Network status indicator
├── NotificationProvider.tsx      # Notification context
├── SafeAreaExample.tsx          # Safe area example
├── SafeAreaWrapper.tsx          # Safe area wrapper
├── ScreenContainer.tsx          # Screen container wrapper
├── ThemedInput.tsx              # Themed input component
├── ThemedText.tsx               # Themed text component
├── ThemedView.tsx               # Themed view component
├── company/                     # Company-related components
│   ├── CompanyContact.tsx       # Company contact info
│   ├── CompanyHeader.tsx        # Company header
│   ├── CompanyOwner.tsx         # Company owner info
│   ├── CompanyPosts.tsx         # Company posts
│   ├── CompanyStats.tsx         # Company statistics
│   └── index.ts                 # Company components export
├── content/                     # Content-related components
│   ├── ApplicationCard.tsx      # Job application card
│   ├── BookmarkedContentList.tsx # Bookmarked content list
│   ├── BottomSheetManager.tsx   # Bottom sheet management
│   ├── ContentCard.tsx          # Content card component
│   ├── CreatePost.tsx           # Post creation form
│   ├── DocumentCard.tsx         # Document card
│   ├── DocumentList.tsx         # Document list
│   ├── DocumentManager.tsx      # Document management
│   ├── DocumentSelector.tsx    # Document selection
│   ├── JobApplicationForm.tsx   # Job application form
│   ├── MyPostCard.tsx           # User's post card
│   ├── PostInteractionBar.tsx   # Post interaction buttons
│   ├── TextToSpeechButton.tsx   # Text-to-speech functionality
│   ├── comments/                # Comment system
│   │   ├── [6 files]           # Comment components
│   │   └── README.md            # Comment system docs
│   └── post/                   # Post-related components
│       ├── [17 files]          # Post components
│       └── [3 files]           # Post types and utilities
├── home/                        # Home screen components
│   └── Header.tsx               # Home screen header
├── navigation/                  # Navigation components
│   ├── OptimizedTabBar.tsx      # Optimized tab bar
│   └── StackNavigator.tsx       # Stack navigator
├── profile/                     # Profile components
│   ├── CompaniesList.tsx        # Companies list
│   ├── DocumentsList.tsx        # Documents list
│   ├── FollowedCompaniesSheet.tsx # Followed companies
│   ├── FollowingGrid.tsx        # Following grid
│   ├── Header.tsx               # Profile header
│   ├── ManagedCompaniesList.tsx # Managed companies
│   ├── ManagedCompaniesSheet.tsx # Managed companies sheet
│   ├── MyPostsList.tsx          # User's posts list
│   ├── ProfileDetails.tsx       # Profile details
│   └── useDocumentUpload.ts     # Document upload hook
└── ui/                         # UI component library
    ├── [27 files]              # UI components
    ├── README.md               # UI components documentation
    └── index.ts                # UI components export
```

Hooks (`/hooks/`)

```
hooks/
├── README.md                    # Hooks documentation
├── index.ts                     # Hooks export
├── useNavigationOptimization.ts # Navigation optimization
├── useNetworkStatus.ts          # Network status hook
├── useOfflineQueue.ts           # Offline queue management
├── useOptimizedFetch.ts         # Optimized data fetching
├── useToast.ts                  # Toast notifications
├── applications/                # Application-related hooks
│   ├── index.ts                 # Applications hooks export
│   ├── useApplicationNotifications.ts # Application notifications
│   ├── useApplications.ts       # Applications management
│   ├── useApplicationStatus.ts  # Application status
│   └── useMyPostApplications.ts  # User's post applications
├── auth/                        # Authentication hooks
│   └── [5 files]               # Authentication hooks
├── companies/                   # Company-related hooks
│   └── [4 files]               # Company management hooks
├── data/                        # Data fetching hooks
│   ├── index.ts                 # Data hooks export
│   └── useDataFetching.ts       # Data fetching utilities
├── notifications/               # Notification hooks
│   └── [4 files]               # Notification management
├── posts/                       # Post-related hooks
│   └── [13 files]              # Post management hooks
├── search/                      # Search hooks
│   ├── index.ts                 # Search hooks export
│   ├── useAds.ts                # Advertisement hooks
│   └── useSearch.ts             # Search functionality
└── ui/                         # UI-related hooks
    ├── [7 files]               # UI interaction hooks
    └── index.ts                # UI hooks export
```

Types (`/types/`)

```
types/
├── index.ts                     # Main types export
├── ads.ts                       # Advertisement types
├── applications.ts               # Application types
├── company.ts                   # Company types
├── documents.ts                 # Document types
├── enums.ts                     # Enum definitions
├── notifications.ts             # Notification types
├── post.ts                      # Post types
├── posts.ts                     # Posts collection types
└── profile.ts                   # Profile types
```

Utils (`/utils/`)

```
utils/
├── AppContext.tsx               # Global app context
├── cache.ts                     # Caching utilities
├── emailService.ts              # Email service
├── errorReporting.ts            # Error reporting
├── globalSheet.ts               # Global bottom sheet
├── networkUtils.ts              # Network utilities
├── notifications.ts             # Notification utilities
├── profileUtils.ts              # Profile utilities
├── storage.ts                   # Storage utilities
├── supabase.ts                  # Supabase client
├── supabaseRequest.ts           # Supabase request wrapper
├── uiFeedback.ts                # UI feedback utilities
├── uploadUtils.ts               # File upload utilities
└── utils.ts                     # General utilities
```

Constants (`/constants/`)

```
constants/
├── Colors.ts                    # Color definitions
├── DesignSystem.ts              # Design system constants
└── searchConfig.ts              # Search configuration
```

Dataset (`/dataset/`)

```
dataset/
├── categories.ts                 # Content categories
├── deadlineOptions.ts           # Job deadline options
├── industries.ts                # Industry definitions
├── jobTypes.ts                  # Job type definitions
└── salaryRanges.ts              # Salary range definitions
```

Assets (`/assets/`)

```
assets/
├── logo.png                     # App logo
├── android/                     # Android-specific assets
│   └── mipmap-*/                # Android icon densities
├── Assets.xcassets/             # iOS asset catalog
│   └── AppIcon.appiconset/      # iOS app icons
├── fonts/                       # Custom fonts
│   └── SpaceMono-Regular.ttf   # Space Mono font
├── images/                      # Image assets
│   ├── adaptive-icon.png        # Android adaptive icon
│   ├── favicon.png              # Web favicon
│   ├── icon.png                 # App icon
│   ├── notification-icon.png    # Notification icon
│   └── splash-icon.png          # Splash screen icon
└── sounds/                      # Audio assets
    └── notification.wav         # Notification sound
```

iOS (`/ios/`)

```
ios/
├── build/                       # iOS build artifacts
├── growork/                     # iOS project files
│   ├── [16 files]              # iOS project configuration
├── growork.xcodeproj/           # Xcode project
├── growork.xcworkspace/         # Xcode workspace
├── Podfile                      # CocoaPods dependencies
├── Podfile.lock                 # CocoaPods lock file
└── Podfile.properties.json      # CocoaPods properties
```

#### 15. Design Reference (Figma)

- Figma: [Growork Design](https://www.figma.com/design/DvqWY3TRz37k3cJn0M5huW/growowk?m=auto&t=FgF9pZpBvRfJ5jQO-1)

Citations: [Figma - Growork](https://www.figma.com/design/DvqWY3TRz37k3cJn0M5huW/growowk?m=auto&t=FgF9pZpBvRfJ5jQO-1)

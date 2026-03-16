# Growork - High-Level File Structure

## Project Root Structure

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

## Detailed Directory Breakdown

### `/app/` - Application Screens (Expo Router)

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

### `/components/` - Reusable UI Components

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

### `/hooks/` - Custom React Hooks

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

### `/types/` - TypeScript Type Definitions

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

### `/utils/` - Utility Functions and Services

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

### `/constants/` - App Constants

```
constants/
├── Colors.ts                    # Color definitions
├── DesignSystem.ts              # Design system constants
└── searchConfig.ts              # Search configuration
```

### `/dataset/` - Static Data

```
dataset/
├── categories.ts                 # Content categories
├── deadlineOptions.ts           # Job deadline options
├── industries.ts                # Industry definitions
├── jobTypes.ts                  # Job type definitions
└── salaryRanges.ts              # Salary range definitions
```

### `/assets/` - Static Assets

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

### `/ios/` - iOS-Specific Files

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

## Key Configuration Files

### Package Management

- **`package.json`**: Dependencies, scripts, and project metadata
- **`bun.lock`**: Bun lockfile for dependency resolution

### Configuration Files

- **`app.json`**: Expo configuration with app settings, permissions, and plugins
- **`tsconfig.json`**: TypeScript compiler configuration
- **`eslint.config.js`**: ESLint rules and configuration
- **`babel.config.js`**: Babel transpilation configuration
- **`eas.json`**: EAS Build configuration for deployment

### Documentation

- **`README.md`**: Project overview and setup instructions
- **`SPECIFICATION.md`**: Comprehensive technical specification
- **`FILE_STRUCTURE.md`**: This file structure documentation

## Architecture Patterns

### Component Organization

- **Feature-based grouping**: Components organized by functionality
- **Atomic design**: UI components follow atomic design principles
- **Reusable components**: Shared components in `/components/ui/`
- **Feature-specific components**: Domain-specific components in feature folders

### Hook Organization

- **Domain separation**: Hooks organized by feature domain
- **Consolidation strategy**: Base hooks with specialized variants
- **Smart organization**: Related hooks grouped together

### File Naming Conventions

- **PascalCase**: React components (e.g., `ContentCard.tsx`)
- **camelCase**: Hooks and utilities (e.g., `useAuth.ts`)
- **kebab-case**: Configuration files (e.g., `app.json`)
- **Descriptive names**: Clear, self-documenting file names

### Import/Export Patterns

- **Barrel exports**: Index files for clean imports
- **Named exports**: Consistent export patterns
- **Type definitions**: Centralized type management

This file structure represents a well-organized, scalable React Native application with clear separation of concerns, maintainable code organization, and comprehensive feature coverage.

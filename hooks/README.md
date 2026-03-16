# Hooks Organization

This directory contains all custom React hooks organized by functionality with **smart consolidation** for similar hooks.

## 🎯 **Consolidation Strategy**

We use a **unified base + specialized variants** approach:

- **Base hooks** with configuration options handle common functionality
- **Specialized variants** provide convenient defaults for specific use cases
- **Backward compatibility** maintained for existing code

## 📁 **Structure**

### 📁 `auth/` - Authentication & User Management

- `useAuth` - Main authentication hook
- `useAuthOperations` - Authentication operations (login, logout, etc.)
- `useProfileCompleteness` - User profile completion tracking
- `usePermissions` - User permission management

### 📁 `posts/` - Posts & Content Management (Consolidated)

- `usePosts(config)` - **Base hook** for all post operations with config options
- `useHomePosts()` - Home feed posts (uses base hook with home defaults)
- `useFeedPosts(pollingInterval)` - Feed posts with polling (uses base hook with feed defaults)
- `useMyPosts(userId)` - User's own posts (uses base hook with user filter)
- `usePostsByType(type, industryFilter)` - Posts filtered by type (uses base hook with type defaults)
- `useSearchPosts()` - Search functionality
- `usePostOperations` - Post CRUD operations
- `useLikes` - Post likes management
- `useComments` - Post comments
- `useCommentLikes` - Comment likes
- `useCommentOperations` - Comment CRUD operations
- `useBookmarks` - Post bookmarks
- `useTextToSpeech` - Text-to-speech functionality

### 📁 `applications/` - Job Applications (Consolidated)

- `useApplicationStatus(config)` - **Base hook** for application statuses with config options
- `useApplicationStatusSingle(postId)` - Single application status (uses base hook with single defaults)
- `useApplicationStatuses(postIds)` - Multiple application statuses (uses base hook with multiple defaults)
- `useApplications` - Job applications management
- `useMyPostApplications` - Applications for user's posts

### 📁 `companies/` - Company Management

- `useCompanies` - Company data management
- `useCompanyFollows` - Company following functionality
- `useDocuments` - Company document management

### 📁 `notifications/` - Notification System (Consolidated)

- `useNotifications(config)` - **Base hook** for all notification types with config options
- `useGeneralNotifications()` - General notifications (uses base hook with general defaults)
- `useInteractionNotifications()` - Interaction notifications (uses base hook with interaction defaults)
- `useApplicationNotifications()` - Application notifications (uses base hook with application defaults)
- `useNotificationOperations()` - Notification operations (uses base hook with operations enabled)
- `useNotificationSetup` - Notification setup
- `usePushNotifications` - Push notification handling

### 📁 `search/` - Search & Discovery

- `useSearch` - Search functionality
- `useAds` - Advertisement management

### 📁 `ui/` - UI & Utilities

- `useColorScheme` - Color scheme management
- `useColorSchemeWeb` - Web-specific color scheme
- `useThemeColor` - Theme color utilities
- `useCustomCommentsBottomSheet` - Custom bottom sheet for comments

### 📁 `data/` - Data & Network

- `useDataFetching` - Data fetching utilities

## 🚀 **Usage Examples**

### **Using Base Hooks with Configuration**

```typescript
// Flexible base hook with custom config
const { posts, loading } = usePosts({
  type: "job",
  industryFilter: "tech",
  pollingInterval: 60000,
  autoFetch: false,
});
```

### **Using Specialized Variants**

```typescript
// Convenient specialized hooks
const { posts: homePosts } = useHomePosts();
const { posts: feedPosts } = useFeedPosts(30000);
const { posts: myPosts } = useMyPosts(userId);
```

### **Import from Main Index**

```typescript
import {
  usePosts,
  useHomePosts,
  useApplicationStatus,
  useNotifications,
} from "@/hooks";
```

### **Import from Specific Categories**

```typescript
import { usePosts } from "@/hooks/posts";
import { useApplicationStatus } from "@/hooks/applications";
```

## ✨ **Benefits of This Organization**

1. **Smart Consolidation** - Similar hooks consolidated into unified base hooks
2. **Modular Design** - Specialized variants provide convenient defaults
3. **Backward Compatibility** - Existing code continues to work
4. **Reduced Duplication** - From 37+ hooks to ~25-30 hooks
5. **Easy Discovery** - Related hooks grouped logically
6. **Maintainable** - Common logic centralized in base hooks
7. **Flexible** - Base hooks accept configuration for custom use cases
8. **Scalable** - Easy to add new variants or extend base functionality

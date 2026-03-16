# CommentsBottomSheet Component

A **custom bottom sheet** component for displaying and managing comments with a modern, intuitive interface. This component uses a native Modal with custom animations instead of the global bottom sheet system.

## Features

- **Custom Bottom Sheet**: Native Modal with smooth slide-up/down animations
- **Fixed Input Section**: Input bar that stays at the bottom and doesn't scroll
- **Keyboard Handling**: Proper keyboard avoidance with KeyboardAvoidingView
- **Custom Header**: Shows comment count and close button
- **Scrollable Comments List**: Displays all comments with loading states
- **Like System**: Like/unlike comments with real-time updates
- **Delete Functionality**: Delete own comments with confirmation
- **Empty State**: Beautiful empty state when no comments exist
- **Loading States**: Skeleton loading for better UX
- **Error Handling**: Error display for failed operations
- **Backdrop**: Tap outside to close with backdrop animation

## Usage

### Basic Usage with Custom Hook

```tsx
import { useCustomCommentsBottomSheet } from "@/hooks/useCustomCommentsBottomSheet";
import CommentsBottomSheet from "@/components/content/comments/CommentsBottomSheet";

function MyComponent() {
  const { isVisible, currentPostId, openCommentsSheet, closeCommentsSheet } =
    useCustomCommentsBottomSheet();

  const handleOpenComments = () => {
    openCommentsSheet("post-id-here");
  };

  return (
    <View>
      <Button onPress={handleOpenComments}>View Comments</Button>

      {/* Custom Bottom Sheet */}
      {currentPostId && (
        <CommentsBottomSheet
          postId={currentPostId}
          visible={isVisible}
          onClose={closeCommentsSheet}
        />
      )}
    </View>
  );
}
```

### Using the Component Directly

```tsx
import CommentsBottomSheet from "@/components/content/comments/CommentsBottomSheet";

function MyComponent() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View>
      <Button onPress={() => setIsVisible(true)}>View Comments</Button>

      <CommentsBottomSheet
        postId="post-id-here"
        visible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </View>
  );
}
```

### Using the Demo Component

```tsx
import CustomCommentsDemo from "@/components/content/comments/CustomCommentsDemo";

function MyComponent() {
  return <CustomCommentsDemo postId="post-id-here" />;
}
```

## Props

### CommentsBottomSheet Props

| Prop      | Type         | Required | Description                             |
| --------- | ------------ | -------- | --------------------------------------- |
| `postId`  | `string`     | Yes      | The ID of the post to load comments for |
| `visible` | `boolean`    | Yes      | Controls the visibility of the sheet    |
| `onClose` | `() => void` | No       | Callback when the sheet is closed       |

### useCustomCommentsBottomSheet Hook

Returns an object with:

| Property             | Type                       | Description                          |
| -------------------- | -------------------------- | ------------------------------------ |
| `isVisible`          | `boolean`                  | Current visibility state             |
| `currentPostId`      | `string \| null`           | Currently open post ID               |
| `openCommentsSheet`  | `(postId: string) => void` | Function to open the comments sheet  |
| `closeCommentsSheet` | `() => void`               | Function to close the comments sheet |

## Layout Structure

```
┌─────────────────────────────────┐
│ Backdrop (tap to close)         │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Handle Bar                  │ │
│ ├─────────────────────────────┤ │
│ │ Header                      │ │
│ │ Comments (5)          [×]   │ │
│ ├─────────────────────────────┤ │
│ │ Scrollable Comments List    │ │
│ │ • Comment 1                 │ │
│ │ • Comment 2                 │ │
│ │ • Comment 3                 │ │
│ ├─────────────────────────────┤ │
│ │ Fixed Input Section         │ │
│ │ Emoji Bar                   │ │
│ │ 😊 😂 ❤️ 👏 🔥 🙏 😢 😮    │ │
│ │ [Avatar] [Input Field] [Send]│ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Key Features Explained

### 1. Fixed Input Section

The input section is **not scrollable** and stays fixed at the bottom of the sheet. It uses `KeyboardAvoidingView` to handle keyboard interactions properly.

### 2. Custom Animations

- **Slide Animation**: Smooth slide-up from bottom when opening
- **Backdrop Animation**: Fade-in backdrop with opacity animation
- **Gesture Support**: Ready for future gesture handling

### 3. Keyboard Handling

- Uses `KeyboardAvoidingView` with platform-specific behavior
- Input section adjusts automatically when keyboard appears
- Keyboard dismissal on backdrop tap

### 4. Custom Styling

- Rounded top corners with shadow
- Handle bar for visual indication
- Theme-aware colors and styling

## Customization

The component uses theme colors from your app's theme system:

- `text`: Primary text color
- `border`: Border colors
- `mutedText`: Secondary text color
- `backgroundSecondary`: Background color

## Dependencies

- `react-native`: Core React Native components
- `@expo/react-native-action-sheet`: For delete confirmation
- `expo-vector-icons`: For icons
- `react-native-gesture-handler`: For gesture support
- Custom hooks: `useAuth`, `useComments`, `useAppContext`
- Custom components: `ThemedText`, `CommentItem`, `EmojiBar`, `CommentsInputBar`

## Migration from Global Bottom Sheet

This custom implementation provides several advantages over the global bottom sheet:

1. **Better Control**: Direct control over visibility and animations
2. **Fixed Input**: Input section doesn't scroll with content
3. **Custom Animations**: Smooth, native-feeling animations
4. **No Global State**: No dependency on global bottom sheet system
5. **Better Performance**: Lighter weight, more focused component

## Example Integration

```tsx
// In your main component
import { useCustomCommentsBottomSheet } from "@/hooks/useCustomCommentsBottomSheet";
import CommentsBottomSheet from "@/components/content/comments/CommentsBottomSheet";

export default function PostCard({ post }) {
  const { isVisible, currentPostId, openCommentsSheet, closeCommentsSheet } =
    useCustomCommentsBottomSheet();

  return (
    <View>
      {/* Your post content */}
      <Pressable onPress={() => openCommentsSheet(post.id)}>
        <Text>Comments ({post.commentCount})</Text>
      </Pressable>

      {/* Custom Bottom Sheet */}
      {currentPostId && (
        <CommentsBottomSheet
          postId={currentPostId}
          visible={isVisible}
          onClose={closeCommentsSheet}
        />
      )}
    </View>
  );
}
```

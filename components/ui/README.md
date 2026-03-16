# SettingsList Component

A flexible settings list component that supports various types of settings items including switches, text inputs, and custom components.

## Features

- **Text Inputs**: Direct text input fields within settings items
- **Switches**: Toggle switches for boolean settings
- **Navigation**: Arrow indicators for navigation items
- **Custom Components**: Support for custom right-side components
- **Themed**: Automatically adapts to light/dark theme
- **Accessible**: Proper touch targets and visual feedback

## Usage

### Basic Settings Item

```tsx
{
  title: 'Edit Profile',
  subtitle: 'Update your personal information',
  icon: 'user',
  onPress: () => router.push('/profile/edit-profile'),
}
```

### Switch Settings Item

```tsx
{
  title: 'Dark Mode',
  subtitle: 'Toggle dark mode',
  icon: 'moon',
  showSwitch: true,
  switchValue: isDarkMode,
  onSwitchChange: (value) => setIsDarkMode(value),
}
```

### Text Input Settings Item

```tsx
{
  title: 'Display Name',
  subtitle: 'Your public display name',
  icon: 'user',
  showTextInput: true,
  textInputValue: displayName,
  textInputPlaceholder: 'Enter your display name',
  onTextInputChange: setDisplayName,
  textInputProps: {
    autoCapitalize: 'words',
    maxLength: 50,
  },
}
```

### Multi-line Text Input

```tsx
{
  title: 'Bio',
  subtitle: 'Tell others about yourself',
  icon: 'edit-3',
  showTextInput: true,
  textInputValue: bio,
  textInputPlaceholder: 'Write a short bio...',
  onTextInputChange: setBio,
  textInputProps: {
    multiline: true,
    numberOfLines: 2,
    maxLength: 200,
  },
}
```

### Custom Right Component

```tsx
{
  title: 'Custom Item',
  subtitle: 'With custom component',
  icon: 'settings',
  rightComponent: <CustomComponent />,
}
```

## Props

### SettingsItemProps

| Prop                   | Type                       | Default | Description                          |
| ---------------------- | -------------------------- | ------- | ------------------------------------ |
| `title`                | `string`                   | -       | The main title of the setting        |
| `subtitle`             | `string`                   | -       | Optional subtitle/description        |
| `icon`                 | `string`                   | -       | Feather icon name                    |
| `onPress`              | `() => void`               | -       | Function called when item is pressed |
| `showArrow`            | `boolean`                  | `true`  | Show navigation arrow                |
| `showSwitch`           | `boolean`                  | `false` | Show toggle switch                   |
| `switchValue`          | `boolean`                  | `false` | Current switch value                 |
| `onSwitchChange`       | `(value: boolean) => void` | -       | Switch change handler                |
| `destructive`          | `boolean`                  | `false` | Red styling for destructive actions  |
| `iconColor`            | `string`                   | -       | Custom icon color                    |
| `rightComponent`       | `React.ReactNode`          | -       | Custom right-side component          |
| `showTextInput`        | `boolean`                  | `false` | Show text input field                |
| `textInputValue`       | `string`                   | `''`    | Current text input value             |
| `textInputPlaceholder` | `string`                   | -       | Text input placeholder               |
| `onTextInputChange`    | `(text: string) => void`   | -       | Text input change handler            |
| `textInputProps`       | `any`                      | `{}`    | Additional TextInput props           |

### SettingsListProps

| Prop                    | Type                | Default | Description                    |
| ----------------------- | ------------------- | ------- | ------------------------------ |
| `sections`              | `SettingsSection[]` | -       | Array of settings sections     |
| `style`                 | `any`               | -       | Custom container style         |
| `contentContainerStyle` | `any`               | -       | Custom content container style |

## Text Input Features

- **Auto-theming**: Automatically adapts to light/dark theme
- **Flexible styling**: Customizable through `textInputProps`
- **Multi-line support**: Supports both single and multi-line inputs
- **Input validation**: Can be extended with validation logic
- **Keyboard handling**: Proper keyboard types and auto-capitalization

## Examples

See `app/settings.tsx` for complete usage examples including text inputs, switches, and navigation items.

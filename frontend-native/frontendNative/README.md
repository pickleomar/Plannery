# Plannery - React Native Mobile App

This is the React Native mobile version of the Plannery event planning application, converted from the original ReactJS web application.

## Features

- **Authentication**: Login and registration with secure token management
- **Dashboard**: Overview of user events with quick actions
- **Event Management**: Create, view, edit, and delete events
- **Event Categories**: Support for various event types (Wedding, Birthday, Corporate, etc.)
- **Profile Management**: User profile and settings
- **Modern UI**: Clean, intuitive mobile-first design

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **AsyncStorage** for local data persistence
- **Ionicons** for beautiful icons
- **Context API** for state management

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd Plannery/frontend-native/frontendNative
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your preferred platform:**
   - **iOS**: Press `i` in the terminal or scan the QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan the QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## Project Structure

```
app/
├── (auth)/           # Authentication screens
│   ├── login.tsx     # Login screen
│   └── register.tsx  # Registration screen
├── (app)/            # Main app screens
│   ├── dashboard.tsx # Dashboard screen
│   ├── events.tsx    # Events list screen
│   ├── create-event.tsx # Event creation screen
│   └── profile.tsx   # Profile screen
├── _layout.tsx       # Root layout
└── index.tsx         # Initial routing
context/
└── AuthContext.tsx   # Authentication context
hooks/
└── useAuth.ts        # Authentication hook
services/
└── authService.ts    # Authentication service
```

## Key Components

### Authentication
- **AuthContext**: Manages user authentication state
- **useAuth Hook**: Provides easy access to auth functions
- **authService**: Handles API calls for authentication

### Navigation
- **Expo Router**: File-based routing system
- **Tab Navigation**: Bottom tabs for main app sections
- **Stack Navigation**: For authentication and modal screens

### UI Components
- **Custom Styling**: Native StyleSheet with consistent design system
- **Ionicons**: Beautiful, consistent iconography
- **Responsive Design**: Optimized for various screen sizes

## API Integration

The app is designed to work with the existing Django backend API. Update the `API_URL` in `services/authService.ts` to point to your backend server.

## Development Notes

### Converting from ReactJS to React Native

1. **Navigation**: Replaced React Router with Expo Router
2. **Storage**: Replaced localStorage with AsyncStorage
3. **Styling**: Converted CSS to React Native StyleSheet
4. **Components**: Replaced HTML elements with React Native components
5. **Icons**: Integrated Ionicons for consistent iconography

### Key Differences from Web Version

- **Touch Interactions**: Uses TouchableOpacity instead of buttons
- **Layout**: Flexbox-based layout system
- **Navigation**: Native navigation patterns
- **Storage**: Async storage for mobile persistence
- **Styling**: Platform-specific styling considerations

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Dependency conflicts**: Delete node_modules and reinstall
3. **iOS build issues**: Ensure Xcode is properly configured
4. **Android build issues**: Ensure Android Studio and SDK are configured

### Performance Tips

- Use `FlatList` for long lists
- Implement proper memoization for expensive components
- Optimize images and assets
- Use appropriate loading states

## Contributing

1. Follow the existing code style and patterns
2. Test on both iOS and Android platforms
3. Ensure proper error handling and loading states
4. Update documentation for new features

## License

This project is part of the Plannery event planning platform.

## Support

For issues and questions, please refer to the main Plannery project documentation or create an issue in the project repository.

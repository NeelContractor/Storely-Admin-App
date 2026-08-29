# Storely Admin App

A React Native admin dashboard built with Expo and TypeScript for managing stores, products, orders, customers, and analytics.

## Features

* Dashboard overview
* Product management
* Order management
* Customer management
* Inventory tracking
* Analytics and reports
* Cross-platform support (Android, iOS, Web)

## Tech Stack

* React Native
* Expo SDK 56
* TypeScript
* React Navigation v6 (Stack + Bottom Tabs)
* Zustand for state management
* TanStack Query for server state
* React Native Paper for UI components

## Getting Started

### Prerequisites

* Node.js 18+
* npm or yarn
* Expo CLI (`npm install -g @expo/cli`)

### Installation

```bash
npm install
```

### Run the App

```bash
npx expo start
```

Then:

* Press `a` to run on Android
* Press `i` to run on iOS (macOS only)
* Press `w` to run on Web

## Project Structure

```
storely-admin-app/
│
├── src/
│   ├── api/                    # API client and endpoints
│   │   ├── apiClient.ts
│   │   └── endpoints.ts
│   │
│   ├── components/
│   │   ├── ecommerce/          # E-commerce specific components
│   │   │   ├── StatCards.tsx
│   │   │   ├── LowStockAlerts.tsx
│   │   │   └── RecentOrdersCard.tsx
│   │   ├── header/             # App header component
│   │   │   └── AppHeader.tsx
│   │   └── ui/                 # Base UI components
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── InputField.tsx
│   │       └── ImageUploadButton.tsx
│   │
│   ├── constants/
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   └── useAuth.ts
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── BottomTabNavigator.tsx
│   │   └── stacks/
│   │       ├── DashboardStack.tsx
│   │       ├── OrdersStack.tsx
│   │       ├── ProductsStack.tsx
│   │       ├── CustomersStack.tsx
│   │       └── MoreStack.tsx
│   │
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── SignInScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── Dashboard/
│   │   │   └── HomeScreen.tsx
│   │   ├── Orders/
│   │   │   └── AllOrdersScreen.tsx
│   │   ├── Products/
│   │   │   ├── AllProductsScreen.tsx
│   │   │   ├── AddProductsScreen.tsx
│   │   │   ├── EditProductsScreen.tsx
│   │   │   └── LowStockScreen.tsx
│   │   ├── Customers/
│   │   │   └── AllCustomersScreen.tsx
│   │   ├── Analytics/
│   │   │   └── AnalyticsScreen.tsx
│   │   ├── Settings/
│   │   │   └── SettingsScreen.tsx
│   │   ├── Store/
│   │   │   ├── StoreProfileScreen.tsx
│   │   │   └── StoresScreen.tsx
│   │   ├── Categories/
│   │   │   └── CategoriesScreen.tsx
│   │   └── More/
│   │       └── MoreScreen.tsx
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── storeService.ts
│   │   ├── userService.ts
│   │   ├── orderService.ts
│   │   ├── imageService.ts
│   │   └── categoryService.ts
│   │
│   ├── store/
│   │   ├── useAppStore.ts
│   │   ├── useAuthStore.ts
│   │   ├── useCategoryStore.ts
│   │   └── useProductStore.ts
│   │
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── ThemeContext.tsx
│   │   └── globalStyles.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   │
│   └── utils/
│       ├── cloudinaryUpload.ts
│       ├── getDeviceToken.ts
│       ├── mockData.ts
│       ├── slug.ts
│       └── tokenStorage.ts
│
├── assets/                     # Static assets (icons, images, fonts)
├── android/                    # Android native project
├── .expo/                      # Expo config cache
├── App.tsx                     # App entry point
├── app.config.ts               # Expo app configuration
├── babel.config.js             # Babel configuration with module resolver
├── eas.json                    # EAS build configuration
├── index.ts                    # Expo entry point
├── metro.config.js             # Metro bundler configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_BE_API_URL=https://your-api-url.com
EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-id
```

## Scripts

* `npm start` - Start Expo development server
* `npm run android` - Build and run on Android
* `npm run ios` - Build and run on iOS
* `npm run web` - Run on Web

## License

MIT
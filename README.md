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
* Expo
* TypeScript
* React Navigation
* Expo Router (optional)

## Getting Started

### Prerequisites

* Node.js
* npm or yarn
* Expo CLI

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

```text
storely-admin-app/
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Loader.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   └── RecentOrders.tsx
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductsScreen.tsx
│   │   │   ├── ProductDetailsScreen.tsx
│   │   │   └── CreateProductScreen.tsx
│   │   │
│   │   ├── orders/
│   │   │   └── OrdersScreen.tsx
│   │   │
│   │   ├── customers/
│   │   │   └── CustomersScreen.tsx
│   │   │
│   │   └── settings/
│   │       └── SettingsScreen.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── BottomTabs.tsx
│   │   └── RootStack.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   └── order.service.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── productStore.ts
│   │   └── uiStore.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   └── useOrders.ts
│   │
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   │
│   ├── constants/
│   │   ├── routes.ts
│   │   └── config.ts
│   │
│   ├── types/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── user.ts
│   │
│   └── utils/
│       ├── formatCurrency.ts
│       ├── formatDate.ts
│       └── validators.ts
│
├── App.tsx
└── package.json
```   

# Storely Admin App - Expo Mobile App

## Project Overview
React Native (Expo) mobile admin app for the Storely e-commerce platform. Mirrors the web dashboard's UI theme.

## Stack
- **Framework**: Expo SDK 52 + React Native 0.76
- **Navigation**: React Navigation v6 (Stack + Bottom Tabs)
- **State**: Zustand
- **Styling**: StyleSheet (no styled-components — RN native)
- **Icons**: @expo/vector-icons (Ionicons)
- **Theme**: Custom ThemeContext with light/dark mode

## Directory Structure
```
src/
├── theme/          # Colors, typography, spacing, ThemeContext
├── components/     # Reusable UI components
│   ├── ui/         # Base: Button, Card, Badge, Avatar, InputField
│   ├── ecommerce/  # StatCards, RecentOrdersCard, LowStockAlerts
│   └── header/     # AppHeader
├── screens/        # All screen components
│   ├── Auth/       # SignInScreen
│   ├── Dashboard/  # HomeScreen
│   ├── Orders/     # AllOrdersScreen
│   ├── Products/   # AllProductsScreen
│   ├── Customers/  # AllCustomersScreen
│   ├── Analytics/  # AnalyticsScreen
│   ├── Settings/   # SettingsScreen
│   └── More/       # MoreScreen (navigation hub)
├── navigation/     # RootNavigator, BottomTabNavigator, stacks/
├── store/          # Zustand stores (useAuthStore, useAppStore)
├── types/          # TypeScript interfaces
├── constants/      # Routes, status colors
└── utils/          # mockData, helpers
```

# Office Food Manager

A React Native mobile app for tracking daily office food consumption, splitting costs among team members, and syncing expenses to Splitwise.

## Features

- Food log home screen showing all day entries with a monthly total cost banner
- New day entry creation — pick a date, select multiple people, choose dishes (countable qty support, e.g. "3 roti"), and save in bulk
- Day detail view with per-person meal breakdowns and the day's total cost
- Cost entry screen for recording the actual cost of a day's food
- People management screen to add and manage team members
- Dish management (admin screen) — create, edit, and delete dishes; toggle countable vs. non-countable mode
- Splitwise integration — authenticate via OAuth, select a group, and sync food expenses as Splitwise entries with per-user shares
- CSV export with configurable date range and file sharing via the system share sheet
- Settings screen for managing Splitwise connection
- Local SQLite database for offline-first data storage
- DM Sans / DM Mono Google Fonts applied via a design-token theme system

## Tech Stack

- React Native 0.81 / Expo SDK 55
- TypeScript
- React Navigation (native stack + bottom tabs)
- expo-sqlite (local database)
- Supabase (`@supabase/supabase-js`) for optional cloud sync
- expo-auth-session (Splitwise OAuth flow)
- expo-secure-store (secure token storage)
- expo-sharing + expo-file-system (CSV export and share)
- @react-native-community/datetimepicker
- @expo-google-fonts/dm-sans, dm-mono

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator, Android Emulator, or the Expo Go app

### Installation

```bash
git clone https://github.com/amanshakya2001/office-food-management-project.git
cd office-food-management-project
npm install
```

Configure your Supabase URL/key and Splitwise OAuth credentials in a `.env` file or `app.json` extra fields as required by `src/lib/supabase.ts` and `src/services/splitwiseService.ts`.

### Running

```bash
expo start
```

## Project Structure

```
src/
  screens/
    Home/           # Food log list and monthly summary
    NewEntry/       # Create a day entry with people and dishes
    DayDetail/      # Per-day meal breakdown and cost
    CostEntry/      # Record the cost for a day
    People/         # Manage team members
    Admin/          # Manage the dish catalogue
    Export/         # CSV export with date range picker
    Settings/       # Splitwise connection settings
  db/
    database.ts                 # SQLite initialisation and migrations
    repositories/               # Typed CRUD helpers (dayEntry, mealEntry, dish, person)
  services/
    splitwiseService.ts         # Splitwise REST API client
    splitwiseSync.ts            # Sync logic: local entries to Splitwise expenses
    csvExportService.ts         # Build and share CSV
    dateUtils.ts                # Date formatting helpers
    whatsappService.ts          # WhatsApp share helper
  navigation/
    RootNavigator.tsx           # Stack + tab navigator setup
  components/
    ui/                         # AppText, AppButton, AppInput, Avatar, Badge, etc.
    shared/                     # DayEntryCard
  theme/
    tokens.ts                   # Colours, spacing, radius constants
  types/
    models.ts                   # TypeScript model interfaces
```

## License

MIT

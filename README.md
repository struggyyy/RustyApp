# RustyApp 🚗

[![License: Proprietary](https://img.shields.io/badge/license-Proprietary-red?style=for-the-badge&logo=github)](LICENSE.md)

**Rusty** is a mobile application designed to gamify civic engagement by empowering users to report abandoned vehicles in their neighborhoods. By identifying and reporting these vehicles, you contribute to cleaner, safer streets while tracking your personal impact.

<p align="center">
  <table style="width: 100%; table-layout: fixed;">
    <tr>
      <td align="center"><img src="./assets/images/readme/Home.png" width="180" alt="Home Page" /></td>
      <td align="center"><img src="./assets/images/readme/Report.png" width="180" alt="Report Form" /></td>
      <td align="center"><img src="./assets/images/readme/FilledReport.png" width="180" alt="Filled Report Form" /></td>
      <td align="center"><img src="./assets/images/readme/MyReports.png" width="180" alt="My Reports Page" /></td>
      <td align="center"><img src="./assets/images/readme/ReportCard.png" width="180" alt="Report Card" /></td>
    </tr>
    <tr>
      <td align="center"><b>Home</b></td>
      <td align="center"><b>Report</b></td>
      <td align="center"><b>Filled in Report</b></td>
      <td align="center"><b>My Reports</b></td>
      <td align="center"><b>Report Card</b></td>
    </tr>
  </table>
</p>

---

## ✨ Features

- **Report Vehicles**: Easily snap a photo, pinpoint the location, and add a description for any abandoned vehicle you find.
- **Track Status**: Monitor your reports in real-time as they move from *Submitted* to *Accepted* and finally *Completed*.
- **Gamification**: Contribute to your community and track your impact with every verified report.
- **Interactive Map**: Explore the history of your reported vehicles on a user-friendly map.
- **Optimized UI**: Enjoy a sleek interface with optimal visibility during the day.
- **Bilingual Support**: Fully localized in **English** and **Polish**.

---

## 📱 How to Use

1. **Create an Account**: Sign up using your email.
2. **Spot a Car**: Look for abandoned vehicles in your area (e.g., flat tires, broken windows, long-term parking).
3. **Submit a Report**:
   - Tap the **"Report a Car"** button.
   - Take a clear photo of the vehicle.
   - Add a brief description.
   - Confirm the location on the map.
4. **Track Progress**: Once your report is verified by an admin, you'll see its status update in real-time!

---

## 🚀 Getting Started

### Prerequisites
- **[Node.js](https://nodejs.org/)** (LTS version recommended)
- **Git**
- **Expo CLI**: Install globally via `npm install -g expo-cli`
- **Android Studio** (for Android Emulator) or **Xcode** (for iOS Simulator, macOS only)
- **[Expo Go](https://expo.dev/client)** app on your physical device (optional)

### Installation & Configuration
1. Clone the repository:
   ```bash
   git clone https://github.com/struggyyy/RustyApp.git
   cd RustyApp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Google Maps API key:
   ```env
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```
4. Setup Firebase Configuration:
   - **Android**: Place `google-services.json` in the root directory.
   - **iOS**: Place `GoogleService-Info.plist` in the root directory.
   - **Service Account**: Place `firebase-service-account.json` in the root directory.
   *(Note: Collaborators must request these from the project lead)*

### Running the App
Start the development server:
```bash
npx expo start
```
- Press **`a`** to open in the Android Emulator.
- Press **`i`** to open in the iOS Simulator.
- Scan the QR code with **Expo Go** to run on a physical device.

---

## 🛠️ Tech Stack

- **Language**: TypeScript (v5.8)
- **Framework**: React Native (v0.81) via [Expo](https://expo.dev/) (v54)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (v6)
- **Backend**: Firebase (v11) (Authentication, Firestore, Storage)
- **Maps**: `react-native-maps` (v1.20) (Google Maps Provider)
- **Styling**: `styled-components` (v6)
- **Internationalization**: `i18next` (v25)

---

## 🧪 Testing & Quality

We use **Jest** for automated testing to maintain application stability.

- **Run Tests**: `npm run test`
- **Watch Tests**: `npm run test:watch`

---

**Copyright © 2026 @struggyyy. All Rights Reserved.**

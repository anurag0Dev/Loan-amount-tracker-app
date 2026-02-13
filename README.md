# Loan Payment Tracker (Personal App)

Mobile-friendly Loan Payment Tracker built with HTML, CSS, and Vanilla JavaScript. Uses LocalStorage for persistence and is structured for conversion to an Android app via Capacitor.

## Project structure

```
Loan amount tracker/
├── www/                    # Web app (Capacitor webDir)
│   ├── index.html          # Main page
│   ├── css/
│   │   └── styles.css      # Styles
│   └── js/
│       └── app.js          # Application logic
├── android/                # Generated after: npx cap add android
├── capacitor.config.json   # Capacitor config
├── package.json
└── README.md
```

## Run as a web app (no install)

1. Open `www/index.html` in a browser, or serve the folder with any static server, e.g.:
   - `npx serve www`
   - Or open the file directly (works offline; LocalStorage works as usual).

## Install and initialize Capacitor

1. **Node.js**  
   Ensure Node.js (v18 or later) is installed.

2. **Install dependencies** (optional; only if you use `npm run` scripts):
   ```bash
   cd "Loan amount tracker"
   npm install
   ```

3. **Install Capacitor** (if not already in the project):
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

4. **Initialize Capacitor** (only if you don’t already have `capacitor.config.json` and `android/`):
   ```bash
   npx cap init "Personal App" com.loanpaymenttracker.app --web-dir www
   ```
   If `capacitor.config.json` already exists with `webDir: "www"`, you can skip this and go to step 5.

5. **Add Android platform**:
   ```bash
   npx cap add android
   ```

6. **Sync web app into native project** (after any change in `www/`):
   ```bash
   npx cap sync
   ```

7. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

## Generate Android APK

1. **Open the Android project**:
   ```bash
   npx cap open android
   ```

2. **In Android Studio**:
   - Wait for Gradle sync to finish.
   - Menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
   - APK path (after build):  
     `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Release APK (optional)**:
   - **Build → Generate Signed Bundle / APK** → choose **APK**.
   - Create or select a keystore, set signing config, then build.  
   Release APK will be in the chosen output folder.

## Features

- Add loan payment amount and date (with date picker).
- Mark payment as “Paid” via checkbox (only paid entries count in totals).
- Display all payments in a card list.
- Totals: **Total amount paid** and **Total months paid** (only checked payments).
- Edit and delete a payment; confirmation before delete.
- “Delete All” in menu with confirmation.
- Data stored in LocalStorage (works offline).
- Layout and styling follow the provided UI design; mobile responsive.

## Tech stack

- HTML5  
- CSS3 (no Tailwind)  
- Vanilla JavaScript  
- Capacitor (for Android)

## Browser support

Works in modern mobile and desktop browsers. LocalStorage is used for persistence.

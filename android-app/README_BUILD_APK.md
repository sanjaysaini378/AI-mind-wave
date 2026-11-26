# AI Mind Wave – Native Android APK Build & Installation Guide

## Option 0: Build Directly on Your Android Phone (100% Free, No PC Needed)

### Method A — Free GitHub Actions Cloud Builder (Easiest, Works on Any Phone)
This project already includes `.github/workflows/build-apk.yml`.
1. Create a free repository at `https://github.com/new` (e.g., `ai-mind-wave`).
2. Upload the extracted `AIMindWave-Android` files (including `.github/workflows/build-apk.yml`) via GitHub web or **Termux** on your phone:
   ```bash
   pkg update -y && pkg install -y git unzip
   termux-setup-storage
   mkdir -p ~/mindwave && cd ~/mindwave
   unzip -o ~/storage/downloads/AI-Mind-Wave-Android-Project.zip
   cd AIMindWave-Android
   git init && git add -A && git commit -m "Build AI Mind Wave APK"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ai-mind-wave.git
   git push -u origin main
   ```
3. Open your GitHub repository's **Actions** tab in Chrome on your phone.
4. Wait ~2–3 minutes for **Build AI Mind Wave APK (Free Cloud Build)** to finish, then download **AI-Mind-Wave-APKs** under Artifacts and tap `app-release.apk` (or `app-debug.apk`) to install.

### Method B — Build Offline Directly on Phone via AndroidIDE
1. Install free open-source **AndroidIDE** (from F-Droid or GitHub Releases) on a 64-bit Android phone (4GB+ RAM).
2. Extract `AIMindWave-Android` into `/AndroidIDEProjects/AIMindWave-Android`.
3. Open the project in AndroidIDE, wait for Gradle Sync, and tap **Run / Build APK** to compile and install directly on your phone.

---

## Requirements (Local PC / Android Studio)
- **Android Studio**: Ladybug (2024.2) or newer
- **JDK**: Java 17 (bundled with Android Studio)
- **Android SDK**: API 35 (Android 15) installed via SDK Manager
- **Target Devices**: Android 10 (API 29) through Android 15 (API 35)

---

## Step 1: Open Project in Android Studio
1. Extract the `AI-Mind-Wave-Android-Project.zip` folder (or open the `/android-app` directory).
2. In Android Studio, click **File → Open** and select the project root folder containing `settings.gradle.kts`.
3. Wait for Gradle Sync to download AndroidX Compose, Material 3, and DataStore dependencies.

---

## Step 2: Generate a Release Signing Keystore
Run this command in the project root terminal (or use **Build → Generate Signed App Bundle / APK** in Android Studio):

```bash
keytool -genkey -v \
  -keystore release-keystore.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias ai-mind-wave-release
```

Then copy `keystore.properties.example` to `keystore.properties` and enter your store password, key alias, and key password.

---

## Step 3: Build the Signed Release APK

### Option A — Inside Android Studio
1. Click **Build → Generate Signed App Bundle or APK**.
2. Choose **APK** → **Next**.
3. Select `release-keystore.jks`, enter your passwords/alias, select **release**, and click **Create**.
4. Find the signed APK at:
   `app/release/app-release.apk`

### Option B — Command Line (Gradle)
```bash
./gradlew assembleRelease
```
The signed release APK is generated at:
`app/build/outputs/apk/release/app-release.apk`

---

## Step 4: Install on Your Android Phone

### Method 1 — USB via ADB
1. On your Android phone, enable **Developer Options** and **USB Debugging**.
2. Connect the phone via USB and run:
```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

### Method 2 — Direct File Transfer
1. Copy `app-release.apk` to your phone's **Downloads** folder.
2. Tap the APK in your Files app and allow **Install unknown apps** if prompted.

---

## Step 5: First-Time Setup on Phone
1. Open **AI Mind Wave** and open the **Permissions** tab.
2. Grant **Display Over Other Apps** (`SYSTEM_ALERT_WINDOW`).
3. Grant **Notifications** (Android 13+) so Pause, Resume, and Stop controls appear in the notification shade.
4. Optionally allow **Unrestricted Battery** so OEM battery managers do not stop long meditation sessions.
5. Return to **Global Mode** and tap the large **ON** button.

## Important Safety & Compatibility Note
- This application provides a purely visual meditation light experience (zero audio, zero vibration, zero supernatural claims).
- Android intentionally hides overlays over banking/payment screens (`FLAG_SECURE`), password prompts, system permission dialogs, and DRM-protected video players.

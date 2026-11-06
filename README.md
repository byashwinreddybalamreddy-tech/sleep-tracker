# SyncStudy - Academic Routine & Focus Optimizer

SyncStudy is a student productivity application that tracks sleep, sets automated smart wake alarms synced to class timetables, counts social media reels to curb doomscrolling, and runs Pomodoro focus sessions.

## 🚀 How to Generate the Android APK via GitHub Actions

This repository includes a ready-to-run GitHub Actions workflow in `.github/workflows/generate-apk.yml`.

### Step 1: Push this project to GitHub
If you haven't initialized Git yet:
```bash
git init
git add .
git commit -m "feat: setup SyncStudy with Android APK workflow"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

### Step 2: GitHub Automatically Builds the APK
1. Go to your repository on **GitHub.com**.
2. Click on the **Actions** tab at the top.
3. You will see **"Generate Android APK"** running.
4. (Or trigger manually by clicking **"Generate Android APK"** on the left -> **"Run workflow"**).

### Step 3: Download your APK
1. When the run finishes (takes ~2 minutes), click on the completed run.
2. Scroll down to the **Artifacts** section at the bottom of the page.
3. Click **"SyncStudy-Android-APK"** to download your zip containing the Android APK!
4. Transfer or open the `.apk` file on your Android phone and tap **Install**.

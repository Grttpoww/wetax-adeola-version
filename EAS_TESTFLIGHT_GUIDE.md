# EAS → TestFlight Deployment Guide

## ✅ Cleanup Complete

### Files Removed (Expo Go Debugging Artifacts):
- `FIX_EXPO_ROUTING.md` - Expo Go routing analysis
- `WETAX_WINDOWS_SETUP.md` - Windows/emulator setup guide
- `README_WINDOWS.md` - Windows development guide
- `SOLUTION_SUMMARY.md` - Expo Go workaround summary
- `START_EXPO_MANUAL_URL.ps1` - Expo Go manual URL script
- `START_EXPO_TUNNEL_FIX.ps1` - Expo Go tunnel script
- `START_EXPO_IOS.ps1` - Expo Go iOS script
- `START_EXPO_FINAL.ps1` - Expo Go final script
- `GET_EXPO_URL.ps1` - Expo URL helper
- `START_EMULATOR_AND_RUN.ps1` - Android emulator script
- `RUN_ANDROID.ps1` - Android run script
- `SETUP_ANDROID_EMULATOR.ps1` - Android setup script
- `RUN_WEB_FIXED.ps1` - Web version script
- `START_EVERYTHING.ps1` - Web startup script
- `START_WEB_SIMPLE.ps1` - Simple web script
- `START_IOS_DEV.ps1` - iOS dev script

### Code Changes Preserved:
✅ All product code changes maintained, including:
- Kinderabzug implementation
- Firebase conditional loading (web compatibility improvement)
- All business logic and features

### Configuration Verified:
✅ **app.json** - Production configuration confirmed:
- Scheme: `wetax-app` ✓
- Slug: `wetax` ✓
- Bundle Identifier: `com.foronered.wetaxapp` ✓
- Version: `1.0.1` ✓
- Build Number: `25` ✓
- Apple Team ID: `W7R4JLL6N3` ✓

✅ **eas.json** - Updated for TestFlight:
- `preview` profile: `distribution: "internal"` (TestFlight-ready)
- `production` profile: Ready for App Store submission
- Removed `simulator: true` from preview profile

---

## 🚀 EAS Build & TestFlight Commands

### Option 1: TestFlight Internal Testing (Recommended)

Build for TestFlight internal distribution:
```bash
cd Wetax-master
eas build --profile preview --platform ios
```

This will:
- Build iOS app with `distribution: "internal"`
- Upload to EAS servers
- Generate a build that can be submitted to TestFlight

### Option 2: Submit to TestFlight Automatically

Build and submit in one command:
```bash
cd Wetax-master
eas build --profile preview --platform ios --auto-submit
```

### Option 3: Manual Submit After Build

1. Build:
```bash
cd Wetax-master
eas build --profile preview --platform ios
```

2. Wait for build to complete (check status):
```bash
eas build:list
```

3. Submit to TestFlight:
```bash
eas submit --platform ios --latest
```

### Option 4: Production Build (App Store)

For App Store submission (not TestFlight):
```bash
cd Wetax-master
eas build --profile production --platform ios
```

Then submit:
```bash
eas submit --platform ios --latest
```

---

## 📋 Pre-Flight Checklist

Before building, ensure:

- [ ] You're logged into EAS: `eas login`
- [ ] Apple credentials configured: `eas credentials`
- [ ] App Store Connect app exists and matches bundle ID: `com.foronered.wetaxapp`
- [ ] Version/build number incremented if needed (currently: `1.0.1` / `25`)
- [ ] Backend API is accessible at `https://wetaxorg.ch`
- [ ] All code changes committed

---

## 🔍 Build Status & Monitoring

Check build status:
```bash
eas build:list
```

View build logs:
```bash
eas build:view [BUILD_ID]
```

---

## 📱 After Build Completes

1. **Check EAS dashboard**: https://expo.dev/accounts/wetax/projects/wetax/builds
2. **Download build** (if needed): `eas build:download [BUILD_ID]`
3. **Submit to TestFlight**: `eas submit --platform ios --latest`
4. **Or use App Store Connect**: Upload manually via Transporter/Xcode

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Build for TestFlight | `eas build --profile preview --platform ios` |
| Build + Auto-submit | `eas build --profile preview --platform ios --auto-submit` |
| Submit existing build | `eas submit --platform ios --latest` |
| Check builds | `eas build:list` |
| View logs | `eas build:view [BUILD_ID]` |
| Production build | `eas build --profile production --platform ios` |

---

## ⚙️ Configuration Summary

**Current Production Config:**
- Bundle ID: `com.foronered.wetaxapp`
- Scheme: `wetax-app`
- Version: `1.0.1`
- Build: `25`
- Team: `W7R4JLL6N3`

**EAS Profiles:**
- `preview`: TestFlight internal distribution
- `production`: App Store distribution
- `development`: Dev client (not for TestFlight)

---

**Ready to build? Run:** `eas build --profile preview --platform ios`






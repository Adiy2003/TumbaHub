# Firebase Deployment Permissions Setup

## Required IAM Roles

To deploy TumbaHub to Firebase Hosting, the service account used in GitHub Actions needs the following roles:

### Critical (Must Have)
1. **roles/serviceusage.serviceUsageConsumer** - MUST HAVE: Allows the service account to use Google APIs (explicitly required by deploy error)
2. **roles/firebasehosting.admin** - Required for Firebase Hosting deployments
3. **roles/firebase.admin** - Broad Firebase access (commonly required for Hosting + backend)

### Optional (Depending on Features)
- **roles/cloudbuild.builds.editor** - For Cloud Function deployments
- **roles/cloudfunctions.admin** - For Cloud Function deployments

## Setup Steps

### 1. Go to Google Cloud Console

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Select the **tumbahub-prod** project from the dropdown at the top

### 2. Navigate to IAM & Admin

1. Go to **IAM & Admin** → **IAM**
2. Click **Grant Access** button

### 3. Find the Service Account

1. In the "New principals" field, enter the service account email:
   ```
   firebase-adminsdk-fbsvc@tumbahub-prod.iam.gserviceaccount.com
   ```

### 4. Assign Required Roles

Assign these roles one at a time by selecting each from the "Select a role" dropdown:

1. **Service Usage Consumer** (CRITICAL)
   - Search for: `serviceusage.serviceUsageConsumer`
   - Select: `Service Usage Consumer`

2. **Firebase Hosting Admin** (REQUIRED)
   - Search for: `firebasehosting`
   - Select: `Firebase Hosting Admin`

3. **Firebase Admin** (REQUIRED)
   - Search for: `firebase.admin`
   - Select: `Firebase Admin`

4. **Cloud Build Editor** (Optional, for Cloud Functions)
   - Search for: `cloudbuild`
   - Select: `Cloud Build Editor`

### 5. Save

Click **Save** to apply the roles.

## Verification

After granting the roles, the GitHub Actions workflow should have permissions to:
- ✅ Deploy to Firebase Hosting
- ✅ Enable the `webframeworks` experiment
- ✅ Build and deploy dynamic routes as Cloud Functions

## Troubleshooting

If deployment still fails after granting roles, check:

1. **Role propagation delay**: IAM role changes can take 1-2 minutes to propagate
2. **Service account verification**: Run the GitHub Actions workflow again after waiting
3. **API enablement**: Ensure these APIs are enabled in your GCP project:
   - Cloud Build API
   - Cloud Functions API
   - Cloud Logging API
   - Firebase Hosting API

To enable APIs: Go to **APIs & Services** → **Library**, search for each API, and click **Enable**.

## What Each Role Does

| Role | Purpose |
|------|---------|
| **Firebase Hosting Admin** | Allows deploying updates to Firebase Hosting sites |
| **Service Usage Admin** | Allows enabling/disabling Google Cloud APIs and experiments |
| **Cloud Build Editor** | Allows building and deploying Cloud Functions needed for dynamic routes |

---

**Have questions?**
- Firebase Docs: https://firebase.google.com/docs/hosting/frameworks/nextjs
- GCP IAM Docs: https://cloud.google.com/iam/docs

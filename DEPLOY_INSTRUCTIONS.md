# 🚀 Deploy TumbaHub to Production - Step-by-Step Guide

## Prerequisites Checklist

Before starting, ensure you have:
- ✅ GitHub account with TumbaHub repository
- ✅ All GitHub secrets configured (check: https://github.com/Adiy2003/TumbaHub/settings/secrets/actions)
- ✅ Firebase project created: `tumbahub-prod`
- ✅ Service account created in Firebase
- ✅ IAM roles granted to service account

**If any are missing, stop here and set them up first.**

---

## Step 1: Link Web App to Firebase Hosting (ONE TIME ONLY)

This is the critical step that was causing the "No Firebase app associated with site" warning.


3. **Retry deployment:**
   - Go to: https://github.com/Adiy2003/TumbaHub/actions
   - Click on failed workflow
   - Click **Re-run all jobs**

### Everything Looks Good But App Not Live?

1. **Check deployment history:**
   - Go to Firebase: https://console.firebase.google.com/project/tumbahub-prod/hosting
   - Click **Deployments** tab
   - Look for successful deployment

2. **Wait a bit longer:**
   - DNS propagation can take 1-2 minutes
   - Try refreshing the app page after 2 minutes

3. **Check if it's actually live:**
   - Visit: https://tumbahub-prod.web.app
   - You should see the login page

---

## Next Steps (Optional)

After successful deployment:

1. **Monitor the app:**
   - Check if users can login
   - Browse through pages
   - Test features

2. **Set up monitoring:**
   - Go to Firebase Console → **Hosting → Analytics** (if available)
   - Monitor performance in **Performance** section

3. **Set up alerts** (optional):
   - Go to **Monitoring** in Firebase Console
   - Create alerts for errors

---

## Quick Reference

| What | Where |
|------|-------|
| **Deployed App** | https://tumbahub-prod.web.app |
| **GitHub Actions** | https://github.com/Adiy2003/TumbaHub/actions |
| **Firebase Console** | https://console.firebase.google.com/project/tumbahub-prod/hosting |
| **Link Web App** | Firebase Console → Hosting → Settings → Linked apps |
| **Logs** | GitHub Actions workflow run logs |

---

## Questions?

- **Firebase Docs:** https://firebase.google.com/docs/hosting/frameworks/nextjs
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Troubleshooting:** Check GitHub Actions logs for specific error messages

---

## Summary

1. ✅ **Link Web app** (Firebase Console) - ONE TIME
2. ✅ **Push to main** (GitHub) - Triggers deployment
3. ✅ **Monitor** (GitHub Actions) - Watch build/deploy### Instructions:

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select project: **tumbahub-prod**

2. **Navigate to Hosting**
   - Click **Hosting** in the left menu
   - You should see your site listed (usually looks like: `tumbahub-prod`)

3. **Go to Site Settings**
   - Click on your hosting site name
   - Click **Settings** (gear icon) at the top
   - Click **Linked apps** tab

4. **Link a Web App**
   - If you see "No apps linked" → Click **Link app**
   - If asked to create one:
     - Select **Web** as the app type
     - Name it: `tumbahub-prod-web`
     - Click **Register app**
   - The app will be automatically linked to your hosting site

5. **Verify**
   - You should now see the Web app listed under "Linked apps"
   - Go back to the Hosting page - the warning should be gone

✅ **Step 1 Complete!** You only need to do this once.

---

## Step 2: Trigger Deployment via GitHub Actions

Now that the Web app is linked, deployment is automatic through GitHub Actions.

### Option A: Push Code Changes (Recommended)

1. **Make a code change** (or use an empty commit):
   ```powershell
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **GitHub Actions automatically triggers:**
   - Build step starts
   - Tests run
   - App deploys to Firebase Hosting
   - Live within 5-10 minutes!

### Option B: Trigger Manually (If No Code Changes)

1. **Push an empty commit:**
   ```powershell
   git commit --allow-empty -m "Trigger production deployment"
   git push origin main
   ```

2. **Or use GitHub UI:**
   - Go to: https://github.com/Adiy2003/TumbaHub/actions
   - Click the **Deploy** workflow
   - Click **Run workflow** → **Run workflow**

---

## Step 3: Monitor Deployment

1. **Watch the deployment:**
   - Go to: https://github.com/Adiy2003/TumbaHub/actions
   - Click the latest workflow run
   - Watch the build progress

2. **Deployment steps:**
   - ✅ Checkout code
   - ✅ Setup Node.js 18
   - ✅ Install dependencies
   - ✅ Build Next.js app
   - ✅ Enable webframeworks experiment
   - ✅ Deploy to Firebase Hosting

3. **Expected time:** 5-10 minutes

---

## Step 4: Access Your Live App

Once deployment completes (green checkmark):

### 🎉 App is Live at:
```
https://tumbahub-prod.web.app
```

### Test Credentials:
- **Email:** alex@example.com
- **Password:** password123
- **Account:** Admin (full access)

---

## Troubleshooting

### Deployment Failed?

1. **Check GitHub Actions logs:**
   - Go to: https://github.com/Adiy2003/TumbaHub/actions
   - Click the failed workflow
   - Scroll to see which step failed
   - Read the error message

2. **Common issues:**

   | Error | Solution |
   |-------|----------|
   | "No Firebase app associated" | Link Web app (Step 1) |
   | "Cannot deploy - webframeworks not enabled" | Re-run workflow, experiment enables automatically |
   | "Permission denied" | Check IAM roles on service account |
   | "Build failed" | Check build logs, fix errors locally first |

4. ✅ **Access app** (https://tumbahub-prod.web.app) - Go live!

**That's it! 🎉**

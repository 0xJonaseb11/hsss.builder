# HSSS Builder App — Deployment Guide

## What You're Setting Up

Your builder ordering app will be a **PWA (Progressive Web App)** — it works like a native app on iPhones, Androids, and desktops. Builders add it to their home screen and it runs full-screen with your HSSS branding. No App Store required.

**You need 3 free accounts:**
1. **GitHub** — stores your code
2. **Vercel** — hosts the app (gives you a URL)
3. **EmailJS** — sends order emails from the app

**Total time: ~30 minutes**

---

## Step 1: Create a GitHub Account

1. Go to **https://github.com/signup**
2. Sign up with your email (any email is fine)
3. Confirm your email address
4. You now have a GitHub account

---

## Step 2: Create a Repository on GitHub

1. Go to **https://github.com/new**
2. Fill in:
   - **Repository name:** `hsss-builder-app`
   - **Description:** HSSS Builder Ordering System
   - **Visibility:** Private (keeps your code private)
3. **DO NOT** tick "Add a README file"
4. Click **Create repository**
5. You'll see a page with setup instructions — **keep this tab open**, you'll need it in Step 4

---

## Step 3: Install Git on Your Computer

**On Mac:**
1. Open Terminal (search "Terminal" in Spotlight)
2. Type `git --version` and press Enter
3. If prompted, click "Install" to install Xcode Command Line Tools
4. Wait for install to finish

**On Windows:**
1. Go to **https://git-scm.com/download/win**
2. Download and run the installer
3. Use all default options
4. Open "Git Bash" from your Start menu

---

## Step 4: Upload the Project Files

You'll need to download the `hsss-app` folder from this conversation first (I'll provide it as a zip).

1. Open Terminal (Mac) or Git Bash (Windows)
2. Navigate to where you saved the project:
   ```
   cd ~/Downloads/hsss-app
   ```
3. Run these commands one at a time:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - HSSS Builder App"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hsss-builder-app.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your actual GitHub username)

4. You'll be asked to log in — use your GitHub email and password (or a Personal Access Token if prompted)

---

## Step 5: Create a Vercel Account & Deploy

1. Go to **https://vercel.com/signup**
2. Click **"Continue with GitHub"** — this links your accounts
3. Authorize Vercel to access your GitHub
4. You're now on the Vercel dashboard

**Deploy the app:**

5. Click **"Add New Project"**
6. You'll see your `hsss-builder-app` repository — click **"Import"**
7. On the configure screen:
   - **Framework Preset:** should auto-detect "Vite"
   - Leave everything else as default
8. Click **"Deploy"**
9. Wait ~60 seconds for the build
10. You'll get a URL like: **`hsss-builder-app.vercel.app`**

🎉 **Your app is now live!** Open that URL on your phone to test it.

---

## Step 6: Set Up EmailJS (Order Emails)

This makes the "Submit Order" button actually send an email to bradley@hsss.net.au.

### Create EmailJS Account
1. Go to **https://www.emailjs.com/**
2. Click **"Sign Up Free"**
3. Sign up with your email

### Connect Your Email Service
4. In the EmailJS dashboard, click **"Email Services"** in the left menu
5. Click **"Add New Service"**
6. Select **"Gmail"**
7. Click **"Connect Account"** and log into the Gmail that will SEND the emails (this could be any Gmail — it's the "from" address)
8. Click **"Create Service"**
9. **Copy the Service ID** (looks like `service_abc123`) — you'll need this

### Create an Email Template
10. Click **"Email Templates"** in the left menu
11. Click **"Create New Template"**
12. Set up the template:

**Subject line:**
```
{{subject}}
```

**Body (paste this exactly):**
```
{{message}}
```

**To Email:**
```
{{to_email}}
```

13. Click **"Save"**
14. **Copy the Template ID** (looks like `template_xyz789`)

### Get Your Public Key
15. Click **"Account"** in the left menu
16. Under **"Public Key"**, copy the key (looks like `AbCdEfGhIjKlMn`)

### Add the Keys to Your App

Now you need to update the file `src/emailService.js` with your real keys.

17. Open your project folder on your computer
18. Open `src/emailService.js` in any text editor (TextEdit on Mac, Notepad on Windows)
19. Find these three lines near the top:
```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
```
20. Replace with your actual values:
```javascript
const EMAILJS_SERVICE_ID = 'service_abc123';
const EMAILJS_TEMPLATE_ID = 'template_xyz789';
const EMAILJS_PUBLIC_KEY = 'AbCdEfGhIjKlMn';
```
21. Save the file

### Push the Update
22. Open Terminal/Git Bash, navigate to your project folder:
```bash
cd ~/Downloads/hsss-app
git add .
git commit -m "Add EmailJS keys"
git push
```

Vercel will automatically rebuild and deploy within ~60 seconds.

---

## Step 7: Test Everything

1. Open your app URL on your phone
2. **Add to Home Screen:**
   - **iPhone:** Tap the Share button (box with arrow) → "Add to Home Screen"
   - **Android:** Tap the three dots menu → "Add to Home Screen" or "Install App"
3. Open from your home screen — it should run full-screen like a real app
4. Submit a test order and check that the email arrives at bradley@hsss.net.au

---

## Step 8: Custom Domain (Optional)

If you want a nicer URL like `orders.hsssproducts.com.au`:

1. In Vercel, go to your project → **Settings** → **Domains**
2. Type in your desired domain (e.g., `orders.hsssproducts.com.au`)
3. Vercel will give you DNS records to add
4. Add those records in your domain provider (wherever hsssproducts.com.au is managed)
5. Wait for DNS to propagate (usually 5-30 minutes)

---

## How to Make Changes Later

**Come back to this Claude project** and ask for changes. I have the full codebase and context. For example:

- "Change the order email to sam@hsss.net.au"
- "Add a new screen type"
- "Update the pricing for Front & Return"
- "Add a field for builder's PO number"

I'll give you the updated files. Then push the changes:

```bash
cd ~/Downloads/hsss-app    # or wherever your project is
git add .
git commit -m "Description of change"
git push
```

Vercel auto-deploys every push — changes go live in ~60 seconds.

---

## Changing the Order Email Address

When you're ready to move past trial and change where orders go:

1. Open `src/emailService.js`
2. Change line 8:
```javascript
export const ORDER_EMAIL = 'newemail@hsss.net.au';
```
3. Save, then push:
```bash
git add .
git commit -m "Update order email"
git push
```

---

## Troubleshooting

**App not loading?**
- Check Vercel dashboard for build errors
- Make sure all files were pushed to GitHub

**Emails not sending?**
- Double-check EmailJS Service ID, Template ID, and Public Key
- Check EmailJS dashboard for error logs
- Free tier = 200 emails/month — upgrade if needed

**App not installing on phone?**
- Must be accessed via HTTPS (Vercel provides this automatically)
- Try clearing browser cache and reloading

**Need help?**
- Come back to this Claude project — I have full context
- Vercel docs: https://vercel.com/docs
- EmailJS docs: https://www.emailjs.com/docs/

---

## Quick Reference

| What | Where |
|------|-------|
| App URL | `hsss-builder-app.vercel.app` (after deploy) |
| Code | `github.com/YOUR_USERNAME/hsss-builder-app` |
| Order email config | `src/emailService.js` line 8 |
| EmailJS dashboard | `dashboard.emailjs.com` |
| Vercel dashboard | `vercel.com/dashboard` |
| HSSS Contacts config | `src/App.jsx` line 34-38 |
| Pricing config | `src/App.jsx` lines 44-78 |


# Gmail App Password Setup Guide

## What is an App Password?

An App Password is a 16-character code that allows less secure apps or devices to access your Google Account. It's more secure than using your regular password because:
- It can only be used for specific purposes
- You can revoke it anytime
- It doesn't give full account access

---

## Steps to Create Gmail App Password

### Step 1: Enable 2-Factor Authentication (if not already enabled)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Look for "How you sign in to Google"
3. Click on **2-Step Verification** → Turn it on
4. Follow the prompts to set up your phone as a verification method

> **Note**: App Passwords require 2FA to be enabled first.

---

### Step 2: Create App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "How you sign in to Google", click **App passwords**
   - If you don't see this option, make sure 2FA is enabled first
3. In the "Select app" dropdown, choose **Mail**
4. In the "Select device" dropdown, choose **Other (Custom name)**
5. Enter a name like: `Dental Clinic Backend`
6. Click **Generate**

---

### Step 3: Copy Your App Password

A 16-character password will appear in a yellow box:
```
xxxx xxxx xxxx xxxx
```

**Important**:
- Copy this password immediately (it only shows once)
- The format is like: `abcd efgh ijkl mnop`
- This is your **SMTP_PASS** value

---

## Using the App Password

In your backend's environment variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # ← Your App Password (with spaces)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "App passwords" not showing | Enable 2-Factor Authentication first |
| Password not working | Make sure to copy exactly (16 chars, no spaces when entering in code) |
| Gmail blocked the app | Check your Gmail for a security alert and allow the access |

---

## Alternative: If You Don't Want to Use Gmail

If you prefer not to use Gmail, you can use:
- **Outlook/Hotmail**: Use your regular password or app password
- **SendGrid**: Free tier available, more reliable for production
- **Mailgun**: Free tier (5,000 emails/month)
- **Nodemailer with any SMTP provider**

Let me know once you have your App Password ready, and we'll proceed with the deployment!
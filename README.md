# Tajuna Bot — Setup Guide

## 📁 Folder Structure
```
tajuna-bot/
├── bot.js          ← main bot code
├── package.json    ← dependencies
├── .env            ← your secret config (EDIT THIS)
├── 390.jpeg        ← QR code image for ₹390 plan (add this)
├── 2000.jpeg       ← QR code image for ₹2000 plan (add this)
└── db.json         ← auto-created when bot runs
```

---

## ⚙️ Step 1 — Edit .env file

Open `.env` and fill in your values:

```
BOT_TOKEN=        ← get from @BotFather on Telegram
ADMIN_CHAT_ID=    ← your Telegram user ID (get from @userinfobot)
GROUP_1_LINK=     ← invite link for ₹390 group
GROUP_2_LINK=     ← invite link for ₹2000 group
GROUP_1_ID=       ← numeric ID of ₹390 group (for auto-kick)
UPI_ID=           ← your UPI ID
```

**To get GROUP_1_ID:**
1. Add @userinfobot to your Telegram group
2. It will show the group's numeric ID (starts with -100...)
3. Copy that number into GROUP_1_ID in .env

---

## 📸 Step 2 — Add QR Images

Put your QR code images in the same folder as bot.js:
- `390.jpeg`  → QR for ₹390 payment
- `2000.jpeg` → QR for ₹2000 payment

---

## 🚀 Step 3 — Run Locally

```bash
npm install
npm start
```

---

## ☁️ Deploy on Railway (Free Hosting)

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Upload this folder or connect your repo
3. In Railway → Variables tab, add all values from .env
4. Click Deploy ✅

---

## ☁️ Deploy on Render (Free Hosting)

1. Go to https://render.com → New Web Service
2. Connect your GitHub repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from .env
6. Click Deploy ✅

---

## 🤖 How the Bot Works

| Action | What happens |
|--------|-------------|
| User clicks ₹390 or ₹2000 | QR code + UPI shown |
| User sends payment screenshot | Admin gets photo + Approve/Reject buttons |
| Admin clicks ✅ Approve | User gets **Join Group** button |
| Admin clicks ❌ Reject | User gets rejection message |
| Day 29 (₹390 only) | Reminder message sent to user |
| Day 30 (₹390 only) | User auto-kicked from group |

---

## ⚠️ Important Notes

- **Never share your BOT_TOKEN** — if leaked, regenerate at @BotFather immediately
- Bot must be **admin** in the ₹390 group for auto-kick to work
- `db.json` stores pending + approved users — don't delete it while bot is running
- Timers (29/30 day) reset if bot restarts — for production use a proper scheduler/database

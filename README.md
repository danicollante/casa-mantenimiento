[README.md](https://github.com/user-attachments/files/26310788/README.md)
# 🏠 Casa Mantenimiento · Phygital Home Tracker

> A physical NFC tag triggers a web app that logs home maintenance tasks to Google Sheets in real time — built with zero infrastructure cost.

**Live demo:** [danicollante.github.io/casa-mantenimiento](https://danicollante.github.io/casa-mantenimiento)  
**Built with:** [Plugueo](https://plugueo.com) · GitHub Pages · Google Apps Script · Google Sheets

---

## What is this?

A home maintenance tracker where the interface is triggered by a **physical NFC tag** — not an app icon on your phone.

Tap the tag → the web app opens → log a task → it writes to Google Sheets instantly.

No native app. No subscription. No server. Total cost: **$0/month** + ~$1 per NFC tag.

---

## The stack

```
NFC tag (physical)
    ↓
Plugueo (event tracking layer)
    ↓
Web app — GitHub Pages (HTML + vanilla JS)
    ↓
Google Apps Script (REST API)
    ↓
Google Sheets (database + dashboard)
```

| Layer | Tool | Cost |
|---|---|---|
| Hosting | GitHub Pages | Free |
| API | Google Apps Script | Free |
| Database | Google Sheets | Free |
| NFC tag | Any NTAG213/215 | ~$1 |
| Physical tracking | Plugueo | Free tier available |

---

## Features

- **Dashboard** — health score, overdue items, items due soon
- **Full list** — all 33 items organized by category, filterable
- **Per-item log** — full history with timestamps, delete entries
- **Label support** — tag-free items like bulb replacements with a location note (e.g. "Bathroom mirror")
- **Real-time sync** — every log entry writes to Google Sheets instantly
- **Offline-first** — saves locally first, syncs in background
- **NFC-ready** — designed to open via physical tag tap

### Categories included
Dryer & Washer · General Cleaning · AC Units · Plumbing · Kitchen Appliances · Bathrooms · Lighting · Garden · Lubrication · Fridge & Freezer · Devices

---

## How to replicate this

### 1. Fork or use this template

Click **"Use this template"** → **"Create a new repository"**

### 2. Enable GitHub Pages

In your repo: **Settings → Pages → Source: Deploy from branch (main)**

Your app will be live at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME`

### 3. Set up Google Sheets

1. Create a new Google Sheet
2. Rename the first sheet to `📋 Log`
3. Create a second sheet named `📊 Estado`
4. In `📋 Log`, add these headers in row 2:
   `Timestamp | Fecha | Ítem | Sección | Días desde anterior | Etiqueta / Nota | Registrado por`

> **Optional:** Download the [pre-formatted template sheet](#) with all formulas, conditional formatting and the full item list already configured.

### 4. Deploy the Apps Script API

1. In Google Sheets: **Extensions → Apps Script**
2. Delete the default code and paste the contents of [`apps-script.js`](./apps-script.js)
3. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** → authorize permissions
5. Copy the deployment URL (`https://script.google.com/macros/s/.../exec`)

### 5. Connect the app to your Sheet

In `index.html`, find this line and replace with your URL:

```javascript
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
```

Commit and push — GitHub Pages deploys automatically.

### 6. Set up weekly email reminders

In the Apps Script editor, run `setupWeeklyTrigger()` once manually.  
You'll receive a Sunday 9am email with overdue and upcoming items.

### 7. Program your NFC tag

Write your GitHub Pages URL to any NFC tag using NFC Tools (iOS/Android).

**Optional:** Route through [Plugueo](https://plugueo.com) for event analytics and redirect management without reprogramming the physical tag.

---

## Customize your items

All tracked items live in the `ITEMS` array in `index.html`:

```javascript
{ id:'your-item-id', name:'Item display name', section:'Category', freq:30 }
```

| Field | Description |
|---|---|
| `id` | Unique identifier (no spaces, lowercase) |
| `name` | Display name shown in the app |
| `section` | Category group |
| `freq` | Frequency in days (`null` for occasional items) |

Add `hasLabel:true` for items where you want to log a location note (like bulb replacements).

---

## Project structure

```
casa-mantenimiento/
├── index.html          # The entire web app (HTML + CSS + JS)
├── apps-script.js      # Google Apps Script API code
└── README.md           # This file
```

---

## The phygital concept

This project is a working example of what **phygital** means in practice:

> A physical object (NFC tag) triggers a digital action (log entry) without the user having to open an app, navigate a menu, or remember a URL.

The friction of logging a task goes from ~30 seconds to ~5 seconds. That's the difference between a system people use and one they abandon.

Built as a case study for [Plugueo](https://plugueo.com) — a platform that connects physical spaces and objects to digital experiences.

---

## Roadmap

- [ ] Migrate item list to Google Sheets (single source of truth)
- [ ] Shortcut automation for fully automatic NFC logging (no tap required)
- [ ] Multi-user support
- [ ] Push notifications via Web Push API

---

## License

MIT — use it, fork it, adapt it.  
If you build something with it, tag [@plugueo](https://plugueo.com) — we'd love to see it.

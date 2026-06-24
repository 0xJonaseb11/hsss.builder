# HSSS Builder Ordering App

**Hydro Seal Shower Systems** — Builder Ordering System

A mobile-first PWA for builders to submit shower screen orders.

## Features
- Quick quotes with live pricing
- Standard orders (Front & Return, Front Only, Splayed, Fixed Panel)
- Custom order requests with site measure scheduling
- Supply & Install / Supply Only pricing
- Email notifications via EmailJS
- PWA — installable on iPhone, Android, and desktop

## Setup
See `DEPLOYMENT-GUIDE.md` for full step-by-step instructions.

```bash
npm install
npm run dev     # Local development
npm run build   # Production build
```

## Tech Stack
- React 18 + Vite
- EmailJS for order notifications
- vite-plugin-pwa for installable app
- Hosted on Vercel

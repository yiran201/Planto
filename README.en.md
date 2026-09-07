<p align="center"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="License: Apache-2.0"></p>

<p align="center"><a href="README.md">简体中文</a> · <a href="README.en.md">English</a> · <a href="README.ja.md">日本語</a></p>

# 🌱 Planto

*Plant your plans. Let time grow them.*

**A calendar-based execution tool for people who are bad at sticking to plans.**

Break a goal into a chain of key events that **must be completed in order** — finish
one to unlock the next. Every completed time block earns you reward points in real
time, which you redeem against your own custom reward list. It swaps "a long to-do
list + three days of motivation" for "a loose framework + instant feedback" — built
for people who don't want to be boxed in by rigid plans but still need a nudge.

## ✨ Features

- 🗓️ **Calendar** — day / week / month / year views, drag-and-drop, recurring events, automatic side-by-side layout for overlapping events
- 📋 **Plans**: break a goal into key events with a strict order — each must be unlocked before the next, so you only ever push on one thing at a time
- 🎯 **Activity library**: a manually maintained personal reference list (links/images/notes) you pick from yourself — it is never auto-scheduled into your calendar
- 🏆 **Reward points**: completed time blocks settle points in real time; redeem them against a reward list you define
- 🔁 **Weekly plan auto-generation** (optional): a four-phase yearly rhythm + a smart scheduling engine
- 🔗 **Google Calendar sync** (optional): read busy slots, push generated plans back to your calendar
- 🌍 **Chinese / English / Japanese**

## 🔒 Data & Privacy

- Local-first: real data lives in a SQLite file inside your browser's OPFS storage — no account, no backend
- One-click JSON export / import for backups
- Clearing browser data wipes your local records — export a backup first; moving to a new device requires a manual import
- The only thing that touches the network is the optional Google Calendar sync — leave it unconfigured and no requests are made at all

## 📸 Screenshots

**Calendar**: plan, edit, or cancel scheduled and recurring events anytime — your weekly
layout is clear at a glance.

![Calendar page](img/image-20260907163058452.png)

**Plans**: create and adjust plans anytime; a plan can hold any number of key events, and
when scheduling on the calendar you can pick the matching event directly from a plan.

![Plans page](img/image-20260907163143697.png)

**Rewards**: completed time settles into points on weekdays and weekends separately —
redeem them against a reward list you define, turning "spend to reward yourself" into
something manageable.

![Rewards page](img/image-20260907163201268.png)

**Settings**: switch the display language and region (China / US / Japan supported for
both), adjust the point growth ratio, or set a background image you like.

![Settings page](img/image-20260907163405936.png)

Try it live: [yiran201.github.io/Planto](https://yiran201.github.io/Planto/) — your data
stays entirely in your own browser and never touches a server, so there's nothing to leak.
For heavier day-to-day use, self-hosting locally per [`DEPLOYMENT.md`](DEPLOYMENT.md) is
still recommended.

The project is in its first release round — feel free to DM me with any issues you run into.

## 🛠️ Tech Stack

[Vue 3](https://vuejs.org) + [Vite](https://vitejs.dev) · [Naive UI](https://www.naiveui.com) ·
[vue-i18n](https://vue-i18n.intlify.dev) · [sqlite-wasm](https://github.com/sqlite/sqlite-wasm) (SQLite in the browser via OPFS, no backend)

## 🚀 Quick Start

```bash
git clone https://github.com/yiran201/Planto.git
cd Planto
npm install
npm run dev      # local dev, fixed at http://localhost:6060
npm run build    # production build, output in dist/
```

On Windows, double-click [`start-planto.bat`](start-planto.bat). On macOS / Linux, run
`chmod +x start-planto.sh && ./start-planto.sh`. Both install dependencies on first run
and then start the dev server automatically.

> If you deploy to your own static host, you'll need to add the COOP/COEP/CORP response
> headers (required by the OPFS-backed database) — see [`vite.config.js`](vite.config.js).
> The [Releases](../../releases) page has a pre-built `dist/` bundle plus a zero-dependency
> [`serve-dist.cjs`](serve-dist.cjs) (already sends these headers) — download, extract, and
> `node serve-dist.cjs` just works, no dependencies or build step needed. The repo also ships
> a GitHub Pages workflow (`.github/workflows/deploy-pages.yml`) — plain static hosting can't
> set custom headers, so it uses a service worker shim (`coi-serviceworker.js`) to add them
> client-side instead. Set Settings → Pages source to "GitHub Actions" once, then every push
> to `master` deploys automatically. Config examples for self-hosting on Nginx/Apache/Tomcat/
> Node are in [`DEPLOYMENT.md`](DEPLOYMENT.md) (currently Chinese only).

## 🔗 Google Calendar Integration (optional)

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/) and enable the **Calendar API**
2. Create an OAuth client ID (Web application), with your local dev URL as an authorized origin
3. Paste the Client ID into Planto's **Settings → Google Sync** panel and sign in

The in-app panel walks through the same steps with clickable links and one-click copy, so you
never have to leave the app to read docs.

## 📖 Documentation

Module map: [`docs/MODULES.md`](docs/MODULES.md). Development rules, task log, and change
history: [`docs/AGENTS.md`](docs/AGENTS.md) / [`docs/REQUESTS.md`](docs/REQUESTS.md) /
[`docs/CHANGELOG.md`](docs/CHANGELOG.md) (currently maintained in Chinese).

## 📄 License

[Apache License 2.0](LICENSE)

## 🤝 Contributing

Issues and pull requests are welcome. If you find this useful, consider giving it a ⭐️.

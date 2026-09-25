<div align="center">

# 🧟🥘 ZombiPaella

### Online multiplayer card game built with React + Supabase

[![Version](https://img.shields.io/badge/version-0.9.0--beta.1-orange.svg)](#-version)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](#-tech-stack)
[![Vite](https://img.shields.io/badge/Vite-powered-646CFF?logo=vite&logoColor=white)](#-tech-stack)
[![Supabase](https://img.shields.io/badge/Supabase-backend-3FCF8E?logo=supabase&logoColor=white)](#-tech-stack)
[![Status](https://img.shields.io/badge/status-beta-yellow.svg)](#-version)

**Battles • Treasures • Special cards • Reactions • Multiplayer**

</div>

---

## 🎮 About

**ZombiPaella** is an online multiplayer card game implemented as a web application.

The game includes turn-based battles, treasures, ingredients, special cards, defensive reactions, permanent effects, temporary treasures, additional actions, extra turns and automatic victory conditions.

The project is currently in **beta**: the main card mechanics are implemented, while full multiplayer playtesting and edge-case fixes are still in progress.

---

## ✨ Features

- 👥 Online multiplayer rooms
- 🔐 Authentication via Supabase
- ⚔️ Turn-based battle system
- 🛡 Attack and defense cards
- 🤝 Battle support cards
- ⚡ Instant / reaction cards
- 💎 Treasure collection
- 🥘 Ingredient-based victory conditions
- 🏰 Fortress and Statue protection
- 🎭 Multiple actions in one turn
- 🔁 Extra turns
- 🛒 Permanent treasure effects
- 🎁 Temporary treasures with discard-to-draw effects
- 🃏 Bazaar mechanic
- 🌊 Treasure rotation
- 🔄 Treasure exchange mechanics
- 🧠 Automatic rule resolution on the server
- 🔴 Realtime game-state updates with Supabase

---

## 🃏 Implemented card mechanics

### Special cards

- `Балачки`
- `Захист паельї`
- `Ультразахист паельї`
- `Хрусткий рис`
- `Шпигун`
- `Петарда`
- `Оборонна фортеця`
- `Величезна статуя`
- `Велика повінь`
- `Кривава битва`
- `Обмін шовком`
- `Торговельні вітри`
- `Чудернацький базар`
- `Місяць над Валенсією`
- `Кажан-клептоман`
- `Голодна курка`
- `Допитливий ельф`
- `Духовний еліксир`
- `Подвійні неприємності`
- `Угода з дияволом`

### Permanent treasures

- `Апасталіпсіс`
- `Сніданок`
- `Скрипучий візок`
- `Захисне зілля`
- `Болотний щур`
- `Часниковий соус`
- `Іржавий серп`
- `Апельсинове дерево`

### Temporary treasures

- `Церемоніальний гребінець`
- `Святковий дует`
- `Святий Грааль`
- `Середньовічний шедевр`
- `Фантомне плавання`
- `Смердючі босоніжки`

---

## 🧠 Some supported interactions

The game already handles combinations such as:

```text
Temporary Treasure + Creaky Cart
Garlic Sauce + Double Action
Breakfast + Orange Tree
Swamp Rat + Crispy Rice
Swamp Rat + battle ingredient bonuses
Fortress + Statue
Protection + Ultra Protection reaction chains
Empty deck + Apastalypsis
```

A large part of the game logic is resolved on the **Supabase/PostgreSQL side**, so critical rules are not trusted to the client alone.

---

## 🛠 Tech stack

### Frontend

- React
- Vite
- React Router
- CSS Modules / SCSS

### Backend

- Supabase
- PostgreSQL
- PostgreSQL functions / RPC
- Database triggers
- Row Level Security
- Supabase Realtime

### Hosting

- GitHub
- GitHub Pages
- `gh-pages`

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/ZombiPaella.git
cd ZombiPaella
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
```

---

## 🔐 Environment variables

The frontend requires:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public Supabase anon key |

> [!IMPORTANT]
> Never commit `.env`, private secrets, database passwords or a Supabase `service_role` key to GitHub.

Recommended `.gitignore`:

```gitignore
node_modules
dist
.env
.env.local
.env.production.local
```

---

## 🌐 GitHub Pages

The repository is configured for deployment under:

```text
/ZombiPaella/
```

Example Vite configuration:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/ZombiPaella/",
});
```

For GitHub Pages, using a hash router avoids refresh errors on dynamic routes such as game and room pages:

```text
/ZombiPaella/#/login
/ZombiPaella/#/profile
/ZombiPaella/#/room/:id
/ZombiPaella/#/game/:id
```

Install `gh-pages`:

```bash
npm install --save-dev gh-pages
```

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

Deploy:

```bash
npm run deploy
```

Then configure GitHub:

```text
Settings
→ Pages
→ Deploy from a branch
→ gh-pages
→ / (root)
```

---

## 🗂 Project structure

A simplified structure:

```text
ZombiPaella/
├─ src/
│  ├─ page/
│  │  ├─ Login/
│  │  ├─ Register/
│  │  ├─ Profile/
│  │  ├─ Room/
│  │  └─ Game/
│  ├─ router/
│  ├─ services/
│  ├─ components/
│  └─ App.jsx
│
├─ public/
├─ .env
├─ .gitignore
├─ package.json
├─ vite.config.js
└─ README.md
```

---

## 🚧 Development status

### `v0.9.0-beta.1`

The project is currently considered a **beta release**.

Main gameplay systems and card effects are implemented. The next stage is full multiplayer playtesting, rule verification and fixing edge cases discovered during real matches.

### Planned release path

```text
0.9.0-beta.1
      ↓
0.9.0-beta.2
      ↓
1.0.0-rc.1
      ↓
1.0.0
```

---

## 🧪 Testing priorities

Before `1.0.0`, the most important scenarios to test are:

- 2-player matches
- 3+ player matches
- full match from start to victory
- battle ties
- chained reactions
- multiple-action turns
- extra-turn behavior
- empty deck behavior
- Bazaar turn transitions
- permanent treasure ownership changes
- temporary treasures combined with `Скрипучий візок`

---

## 🏷 Version

Current version:

```text
v0.9.0-beta.1
```

`0.9.0` means the project is close to its first stable release.

`beta.1` means this is the first public beta build intended for testing before `1.0.0`.

---

## 👨‍💻 Development

Made as a web implementation of the game's mechanics using React, Vite and Supabase.

If you find a gameplay bug during testing, a useful report format is:

```text
Card / mechanic:
What happened:
What should happen:
Steps to reproduce:
Extra notes:
```

---

<div align="center">

### 🧟 Ready to cook the most dangerous paella?

**ZombiPaella · v0.9.0-beta.1**

</div>

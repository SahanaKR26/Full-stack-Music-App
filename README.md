# Groovvy – Music App

A full‑stack music streaming app: upload your own tracks, search your library, manage playlists, and upgrade to premium tiers.

---

## About

**Groovvy** is a demo music platform with:

- **Local library** – Upload and play your own audio files (stored on the server).
- **Search** – Search your uploaded songs; optionally search **Spotify** (when token is set) and play 30s previews.
- **Spotify** – With a Spotify Web API token, the app shows your top tracks on Home and lets you search Spotify from Search.
- **User accounts** – Register, login, profile, and subscription plans (Free, Premium, Pro).
- **Playlists & favorites** – Create playlists and like songs.
- **Artists** – Browse artists (admin can add artists with bios and images).
- **Admin panel** – Manage users, uploads, and artists.

Stack: **React (Vite)** frontend, **.NET 8 (ASP.NET Core)** backend, **SQLite** database, **JWT** auth.

---

## Features

| Feature | Description |
|--------|-------------|
| **Search** | Search your library; toggle to **Spotify** to search and play 30s previews (requires token). |
| **Upload** | Users can upload audio files (and optional art) to the local library. |
| **Playback** | Global player bar: play/pause, next/prev, seek, volume, shuffle, repeat. |
| **Library** | Liked songs, recently played, and recommended (by liked artists). |
| **Playlists** | Create and manage playlists; add/remove songs. |
| **Artists** | Browse artists; admins add/edit artists with name, bio, image. |
| **Subscriptions** | Free / Premium / Pro plans; “Fake Checkout” upgrades (no real payment). |
| **Profile** | Update email, password, avatar. |
| **Admin** | Dashboard, user list (block/delete), upload management, artist CRUD. |

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **.NET 8 SDK**

On a new machine, install:

- Node: [https://nodejs.org](https://nodejs.org)
- .NET 8: [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)

---

## Install & Run (one go)

### 1. Clone / open the project

```bash
cd "/Users/venkataravindrapv/music app"
```

### 2. Backend

```bash
cd backend
dotnet restore
dotnet run
```

Leave this running. By default the API is at **http://localhost:5292** (or the port shown in the terminal).

### 3. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (e.g. **http://localhost:5173**).

### 4. First use

- Register a user, then log in.
- Use **Search** to find songs in your library.
- Go to **Upgrade** to change plan (fake checkout).
- Go to **Artists** to see artists (add some from Admin if needed).

---

## Quick reference

| Task | Command |
|------|--------|
| Run backend | `cd backend && dotnet run` |
| Run frontend | `cd frontend && npm run dev` |
| Build frontend | `cd frontend && npm run build` |
| Backend URL | `http://localhost:5292` (or check terminal) |
| Frontend URL | `http://localhost:5173` (or check Vite output) |

Set `VITE_API_URL` (e.g. in `.env`) if the API is on another host/port.

**Spotify (optional):** To enable Spotify search and “Your top tracks” on Home, add to `frontend/.env`:
```bash
VITE_SPOTIFY_TOKEN=your_spotify_bearer_token
```
Get a token from the [Spotify Web API](https://developer.spotify.com/documentation/web-api/concepts/authorization). Tokens expire in about 1 hour; refresh and update `.env` when needed.

**Restart after code changes:** After changing backend (C#) code, stop the backend (Ctrl+C) and run `dotnet run` again. After changing frontend code, Vite will hot-reload; if you change env or config, restart `npm run dev`.

---

## Create admin user (local)

Admins cannot be created via the normal Register flow. To create an admin user locally (e.g. for development):

1. Ensure the backend is running and the environment is **Development** (default when you run `dotnet run`).
2. Call the one-time setup endpoint (only works when **no** admin exists yet):

```bash
curl -X POST http://localhost:5292/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourSecurePassword"}'
```

3. Log in at the app with that username and password. You will be redirected to the Admin panel.

- If you get "An admin user already exists", an admin was already created; use that account or create a new one via the database.

**Change admin password (local):** To change an existing admin’s password (e.g. you forgot it), use this endpoint (Development only):

```bash
curl -X POST http://localhost:5292/api/auth/change-admin-password \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","newPassword":"YourNewPassword"}'
```

Replace `admin` with your admin username and `YourNewPassword` with the new password (at least 4 characters). Then log in at the app with that username and new password.

- Admin credentials are **not** in config files; they live in the database (`backend/musicapp.db`, `Users` table, role = `Admin`). Use the endpoints above or edit the DB to change them.

---

## Project structure

```
music app/
├── backend/          # ASP.NET Core 8 API
│   ├── Controllers/  # Auth, Songs, Artists, Users, Favorites, Playlists, etc.
│   ├── Data/         # DbContext, migrations
│   ├── Models/       # User, Song, Artist, Playlist, etc.
│   └── Program.cs
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── pages/    # Home, Search, Library, Artists, Upgrade, Admin*, etc.
│   │   ├── context/  # Auth, Player
│   │   └── services/ # api.js
│   └── package.json
└── README.md
```

---

## License

This project is for learning/demo use.

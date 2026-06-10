 
<!--- -------------------------------------------------------------------------------------------------------------------------------------------------------- -->
<!--- -- Campus Marketplace - IIT Bhilai --------------------------------------------------------------------------------------------------------------------- -->
<!--- -------------------------------------------------------------------------------------------------------------------------------------------------------- -->

<div align="center">

  <!-- Simple Gradient Header - No GIF -->
  <div>
    <h1 style="color: white; font-size: 3rem; margin: 0; font-weight: 700;">Campus Marketplace</h1>
    <h3 style="color: rgba(255,255,255,0.9); font-weight: 400; margin: 0.5rem 0 0 0;">IIT Bhilai</h3>
  </div>

  <p align="center">
    <strong>A community-first intranet marketplace platform for students to buy, sell, exchange, and pre-order items within IIT Bhilai.</strong>
  </p>

  <!-- Badges Row -->
  <p align="center">
    <img src="https://img.shields.io/badge/Status-Deployed-00C853?style=for-the-badge&logo=vercel&logoColor=white" alt="Status: Deployed" />
    <img src="https://img.shields.io/badge/Development-Active-2979FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="Development: Active" />
    <img src="https://img.shields.io/badge/License-MIT-F5B041?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="License: MIT" />
    <img src="https://img.shields.io/badge/PRs-Welcome-00ACC1?style=for-the-badge&logo=git&logoColor=white" alt="PRs Welcome" />
  </p>

<p align="center">
  <img src="https://img.shields.io/github/issues-pr-closed/OpenLake/Campus-Marketplace?color=6A1B9A&label=Pull%20Requests&style=flat-square" alt="Pull Requests Merged" />
  <img src="https://img.shields.io/github/issues/OpenLake/Campus-Marketplace?color=EF6C00&label=Open%20Issues&style=flat-square" alt="Open Issues" />
  <img src="https://img.shields.io/github/contributors/OpenLake/Campus-Marketplace?color=2E7D32&label=Contributors&style=flat-square" alt="Contributors" />
  <img src="https://img.shields.io/github/stars/OpenLake/Campus-Marketplace?style=flat-square&label=Stars&color=FFB300" alt="Stars" />
  <img src="https://img.shields.io/github/forks/OpenLake/Campus-Marketplace?style=flat-square&label=Forks&color=0288D1" alt="Forks" />
</p>

 

  <!-- Repository Links -->
  <p align="center">
    <a href="https://github.com/OpenLake"><img src="https://img.shields.io/badge/OpenLake-Organization-181717?style=for-the-badge&logo=github&logoColor=white" /></a>
    <a href="https://github.com/OpenLake/Campus-Marketplace"><img src="https://img.shields.io/badge/Project-Repository-2d2d2d?style=for-the-badge&logo=github&logoColor=white" /></a>
  </p>

</div>

<br />

 

## Table of Contents
<div align="center">

  <table width="100%">
    <tr>
      <td width="50%" valign="top">
        <table align="center">
          <tr>
            <td align="center"><a href="#about-the-project">About</a></td>
            <td align="center">Overview, features, and tech stack</td>
          </tr>
          <tr>
            <td align="center"><a href="#docker-setup">Docker Setup</a></td>
            <td align="center">One-command containerized deployment</td>
          </tr>
          <tr>
            <td align="center"><a href="#getting-started">Getting Started</a></td>
            <td align="center">Manual development setup (no Docker)</td>
          </tr>
          <tr>
            <td align="center"><a href="#usage">Usage</a></td>
            <td align="center">How to navigate and use the platform</td>
          </tr>
          <tr>
            <td align="center"><a href="#contributing">Contributing</a></td>
            <td align="center">Guidelines for contributors</td>
          </tr>
          <tr>
            <td align="center"><a href="#maintainers">Maintainers</a></td>
            <td align="center">Core team</td>
          </tr>
        </table>
      </td>
      <td width="50%" align="center">
        <img src="https://github.com/user-attachments/assets/a3d6b8c0-cba9-406e-be10-f36d9e0f8999" 
             alt="Campus Marketplace Preview" 
             style="border-radius: 10%; width: 90%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
      </td>
    </tr>
  </table>

</div>
<br /> 

## About the Project

This project provides a dedicated intranet marketplace for the IIT Bhilai community.

### Tech Stack

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,tailwind,nodejs,express,mongodb,docker,cloudinary" />
  <br />
  <strong>Frontend:</strong> React + Vite + Tailwind CSS &nbsp;|&nbsp;
  <strong>Backend:</strong> Node.js + Express + MongoDB &nbsp;|&nbsp;
  <strong>File Storage:</strong> Cloudinary &nbsp;|&nbsp;
  <strong>Containerization:</strong> Docker & Docker Compose
</div>

<br />
 

## Docker Setup

This project is fully containerized. Run the entire stack with a single command.

### Prerequisites

- Docker Desktop (version 20.10+) or Docker Engine + Compose V2
- At least 4GB RAM allocated to Docker

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/OpenLake/Campus-Marketplace.git
   cd Campus-Marketplace
   ```

2. **Create environment files** (see [Environment Variables](#environment-variables))
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start all services**
   ```bash
   docker compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:4173
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/healthcheck

### Service Ports (default)

| Service   | Container Port | Host Port |
|:----------|:--------------:|:---------:|
| Frontend  | 4173           | 4173      |
| Backend   | 5000           | 5000      |
| MongoDB   | 27017          | (internal)|

> **Important:** For local Docker development, `VITE_API_URL` must point to **host port 5000** (`http://localhost:5000/api`), not the container service name. The browser cannot resolve `backend:5000`.

<br />
 
## Environment Variables

Create a `.env` file inside `backend/` and `frontend/` respectively.
 

 

## Getting Started

For local development **without** Docker, follow these manual steps.

 
### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (see template above).
4. Start the development server:
   ```bash
   npm run dev
   ```
   The API will run at `http://localhost:5000`.

### Frontend Setup

1. Open another terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (see template above).
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run at `http://localhost:4173`.

<br />

 

## Usage

### Using Docker (recommended)

1. Ensure Docker is running.
2. `docker compose up -d`
3. Open http://localhost:4173 in your browser.
4. Register or log in using email/password or Google OAuth.
5. Create a listing (sell an item), browse listings, and express interest.

### Manual Development

Run backend and frontend separately as described in [Getting Started](#getting-started).

### Common Actions

| Action | How to do it |
|:-------|:-------------|
| List an item | Click "Sell" → fill in details → upload images → publish. |
| Express interest | On a listing page, click "I'm interested" → seller receives a notification. |
| Manage listings | Go to Dashboard → My Listings → edit or mark as sold. |

<br />

---

## Troubleshooting

### Docker Issues

#### Port already in use

```bash
# Find process using port 5000 (Linux/macOS)
sudo lsof -i :5000
# Kill it
kill -9 <PID>

# Or change the host port in docker-compose.yml
```

#### Frontend can't reach backend (404 on API calls)

- Wrong `VITE_API_URL` – Ensure it's `http://localhost:5000/api` (not `http://localhost:4173`).
- CORS misconfiguration – Backend `CORS_ORIGIN` must include `http://localhost:4173`.
- Container network – If you changed ports, rebuild: `docker compose up --build`

#### Google OAuth fails with 404

- Check that `users/google` route exists in backend routes (`/api/users/google`).
- Verify your frontend `api.js` has `baseURL: 'http://localhost:5000/api'`.

#### Cloudinary upload errors

- Ensure your Cloudinary credentials are correct and the environment variables are loaded.
- Restart the backend after changing `.env`.

### Logs and Debugging

```bash
# View all logs
docker compose logs

# Follow backend logs only
docker compose logs -f backend

# Follow frontend logs
docker compose logs -f frontend

# Rebuild a single service
docker compose up -d --build backend
```

 
<br />

---

## Contributing

We welcome contributions from the community.  
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines before submitting a pull request.

### Development Workflow

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

<br />

---

## Maintainers

| Avatar | Name | GitHub |
|:------:|:----:|:------:|
| <img src="https://github.com/Hark-github.png?size=60" width="50" style="border-radius: 50%;" /> | **Harshit Kandpal** | [@Hark-github](https://github.com/Hark-github) | 
| <img src="https://github.com/placeholder.png?size=60" width="50" style="border-radius: 50%;" /> | **Garvit Sharma** | [@garvit-sharma](https://github.com) | 

See [MAINTAINERS.md](MAINTAINERS.md) for the full list.

<br />

 
## License

Distributed under the **MIT License**.  
See [LICENSE](LICENSE) for details.

```
MIT License

Copyright (c) 2025 OpenLake Society

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

<br />

 

Built with ❤️ by Harshit Kandpal @ OpenLake

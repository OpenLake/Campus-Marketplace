Here is a heavily designed README.md for your Campus Marketplace project, featuring a modern gradient aesthetic, detailed badges, and the requested credit line.
```markdown
<!--- -------------------------------------------------------------------------------------------------------------------------------------------------------- -->
<!--- -- Campus Marketplace - IIT Bhilai --------------------------------------------------------------------------------------------------------------------- -->
<!--- -------------------------------------------------------------------------------------------------------------------------------------------------------- -->

<div align="center">
  
  <!-- Dynamic Header with Gradient -->
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:3b82f6,100:8b5cf6&height=200&section=header&text=Campus%20Marketplace&fontSize=60&fontColor=ffffff&animation=fadeIn" width="100%" />

  <h1 align="center" style="font-size: 2.8rem; margin-top: -40px;">
    🛍️ Campus Marketplace - IIT Bhilai
  </h1>
  
  <p align="center">
    <strong>A community‑first intranet marketplace platform for students to buy, sell, exchange, and pre‑order items within IIT Bhilai.</strong>
  </p>

  <!-- Badges Row -->
  <p align="center">
    <img src="https://img.shields.io/badge/Status-Deployed-00C853?style=for-the-badge&logo=vercel&logoColor=white" alt="Status: Deployed" />
    <img src="https://img.shields.io/badge/Development-Ongoing-2979FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="Development: Ongoing" />
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

---

## 📖 Table of Contents
| Section | Description |
|:-------:|:------------|
| [About](#about-the-project) | Overview, features, and tech stack |
| [Docker Setup](#docker-setup) | One‑command containerized deployment |
| [Environment Variables](#environment-variables) | Configuration keys and secrets |
| [Getting Started](#getting-started) | Manual development setup (no Docker) |
| [Usage](#usage) | How to navigate and use the platform |
| [Troubleshooting](#troubleshooting) | Common issues and their fixes |
| [Contributing](#contributing) | Guidelines for contributors |
| [Maintainers](#maintainers) | Core team behind the project |
| [License](#license) | MIT open‑source license |

<br />

---

## 📌 About the Project <sup>[↥ Back to top](#table-of-contents)</sup>

Students at IIT Bhilai frequently need to buy/sell used items (cycles, books, mattresses), pre‑order food from campus cafes, or sell club merchandise. Existing solutions rely on WhatsApp groups or external platforms – inefficient and not campus‑focused.  
This project provides a **dedicated intranet marketplace** for the IIT Bhilai community.

### ✨ Key Features
| Feature | Description |
|:--------|:------------|
| **Student‑to‑student listings** | Buy/sell second‑hand goods (cycles, books, appliances, etc.) |
| **Campus storefronts** | Pre‑order from AtMart, Tech Café, and official campus vendors |
| **Merch sales** | Clubs/CoSA can sell T‑shirts, hoodies, and event merchandise directly |
| **Search & discover** | Filter by category, price, condition, and location |
| **Mobile‑first design** | Built as a Progressive Web App (PWA) for quick access on any device |

### ⚙️ Tech Stack
<div align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,tailwind,nodejs,express,mongodb,docker,cloudinary" />
  <br />
  <strong>Frontend:</strong> React + Vite + Tailwind CSS &nbsp;|&nbsp;
  <strong>Backend:</strong> Node.js + Express + MongoDB &nbsp;|&nbsp;
  <strong>File Storage:</strong> Cloudinary &nbsp;|&nbsp;
  <strong>Containerization:</strong> Docker & Docker Compose
</div>

<br />

---

## 🐳 Docker Setup <sup>[↥ Back to top](#table-of-contents)</sup>

This project is fully containerized. Run the entire stack with a single command.

### 📋 Prerequisites
- Docker Desktop (version 20.10+) or Docker Engine + Compose V2
- At least 4GB RAM allocated to Docker

### 🚀 Quick Start
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
   - **Frontend:** http://localhost:4173
   - **Backend API:** http://localhost:5000/api
   - **Health Check:** http://localhost:5000/api/healthcheck

### 🔌 Service Ports (default)
| Service   | Container Port | Host Port |
|:----------|:--------------:|:---------:|
| Frontend  | 4173           | 4173      |
| Backend   | 5000           | 5000      |
| MongoDB   | 27017          | (internal)|

> **Important:** For local Docker development, `VITE_API_URL` must point to **host port 5000** (`http://localhost:5000/api`), not the container service name. The browser cannot resolve `backend:5000`.

<br />

---

## 🔧 Environment Variables <sup>[↥ Back to top](#table-of-contents)</sup>

Create a `.env` file inside `backend/` and `frontend/` respectively.

### Backend `.env`
```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/campus-marketplace

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS (for frontend connection)
CORS_ORIGIN=http://localhost:4173

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend `.env`
```ini
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

> **Security Note:** Never commit `.env` files. Use `.env.example` as a template and keep secrets local.

<br />

---

## 🛠️ Getting Started <sup>[↥ Back to top](#table-of-contents)</sup>

For local development **without** Docker, follow these manual steps.

### Prerequisites
| Requirement | Version |
|:------------|:-------:|
| Node.js     | v18+    |
| MongoDB     | local or Atlas |
| Cloudinary account | free tier |
| Google OAuth credentials | (for social login) |

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

---

## 🎮 Usage <sup>[↥ Back to top](#table-of-contents)</sup>

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
| **List an item** | Click "Sell" → fill in details → upload images → publish. |
| **Express interest** | On a listing page, click "I'm interested" → seller receives a notification. |
| **Manage listings** | Go to Dashboard → My Listings → edit or mark as sold. |

<br />

---

## 🧩 Troubleshooting <sup>[↥ Back to top](#table-of-contents)</sup>

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
- **Wrong `VITE_API_URL`** – Ensure it's `http://localhost:5000/api` (not `http://localhost:4173`).
- **CORS misconfiguration** – Backend `CORS_ORIGIN` must include `http://localhost:4173`.
- **Container network** – If you changed ports, rebuild: `docker compose up --build`

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

### Common Manual Fixes
| Problem | Solution |
|:--------|:---------|
| `EADDRINUSE: address already in use` | Kill the process using the port (see above) |
| MongoDB connection error | Check `MONGO_URI` – inside Docker use `mongodb://mongodb:27017/...` |
| CORS error in browser | Set `CORS_ORIGIN=http://localhost:4173` in backend `.env` |
| `401 Unauthorized` | Clear browser localStorage / cookies, log in again |

<br />

---

## 🤝 Contributing <sup>[↥ Back to top](#table-of-contents)</sup>

We welcome contributions from the community! 🎉  
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines before submitting a pull request.

### Development Workflow
1. **Fork** the repository.
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`).
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`).
4. **Push to the branch** (`git push origin feature/amazing-feature`).
5. **Open a Pull Request**.

<div align="center">
  <img src="https://raw.githubusercontent.com/gist/ManulMax/2d20af60d709805c55fd784cdd96146b/raw/1995b3b9dce47f674ecfedb002beff115dab7bbe/code.gif" width="400" />
</div>

<br />

---

## 👥 Maintainers <sup>[↥ Back to top](#table-of-contents)</sup>

| Avatar | Name | GitHub | Role |
|:------:|:----:|:------:|:----:|
| <img src="https://github.com/Hark-github.png?size=60" width="50" style="border-radius: 50%;" /> | **Harshit Kandpal** | [@Hark-github](https://github.com/Hark-github) | Project Lead |
| <img src="https://github.com/placeholder.png?size=60" width="50" style="border-radius: 50%;" /> | **Garvit Sharma** | [@garvit-sharma](https://github.com) | Backend Core |

See [MAINTAINERS.md](MAINTAINERS.md) for the full list.

<br />

---

## 📄 License <sup>[↥ Back to top](#table-of-contents)</sup>

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

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:3b82f6,100:8b5cf6&height=120&section=footer" width="100%" />
  
  <h3>Built with ❤️ by Harshit Kandpal @ OpenLake</h3>
  
  <p>
    <a href="https://github.com/OpenLake/Campus-Marketplace/issues">Report Bug</a> •
    <a href="https://github.com/OpenLake/Campus-Marketplace/issues">Request Feature</a> •
    <a href="https://github.com/OpenLake">OpenLake Society</a>
  </p>
  
  <p>
    <img src="https://komarev.com/ghpvc/?username=OpenLake-Campus&label=Project%20Views&color=8b5cf6&style=flat" alt="Project Views" />
  </p>
</div> 
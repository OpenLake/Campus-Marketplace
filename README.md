# 🏫 Campus Marketplace - IIT Bhilai

![image](https://github.com/user-attachments/assets/a3d6b8c0-cba9-406e-be10-f36d9e0f8999)

## 📁 Project Structure

```
Campus-Marketplace/
├── backend/           # Node.js + Express API
│   ├── src/
│   ├── public/
│   ├── .env
│   └── package.json
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── markdown/          # Documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (version 20.10+)
- Docker Compose (version 2.0+)
- Cloudinary account (free tier)

### Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Campus-Marketplace
   ```

2. **Create environment file:**

   ```bash
   cp .env.example .env
   # Edit .env and add your credentials
   ```

3. **Start the application:**

   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - Health Check: http://localhost:3000/api/healthcheck

📚 **For detailed setup instructions, see [SETUP.md](./SETUP.md)**

🔒 **For security information, see [SECURITY.md](./SECURITY.md)**

---

## 📦 Project Status

✅ **Backend**: Core API with authentication, listing management, image upload, and RBAC completed
✅ **Frontend**: Multi-step listing creation, authentication, image upload completed
✅ **Docker**: Full containerization with MongoDB, backend, and frontend
✅ **Security**: Environment-based configuration, no hardcoded credentials
🚧 **In Progress**: Additional features and UI improvementsmunity-first marketplace app for IIT Bhilai students — built _by the students, for the students_.

---

## 🚀 What’s the Idea?

Campus Marketplace is a platform where students of IIT Bhilai can **buy, sell, exchange, or pre-order** items within the campus community.

Whether you're:

- A graduating student selling your **cycle or mattress** 🛏️🚲
- Looking to **pre-order food** from Tech Café or AtMart 🥪
- CoSA and clubs selling **merchandise, T-shirts, or hoodies** 👕
  — this is the one-stop solution.

---

## 🛠️ Core Features (Planned)

- 📦 **Student-to-student listing**: Buy/sell second-hand goods like cycles, books, appliances, etc.
- 🛍️ **Campus Storefronts**: Pre-order from AtMart, Tech Café, or any official campus vendor.
- 👕 **Merch Sales**: Allow clubs/CoSA to sell merchandise directly through the app.
- 🔍 **Search & Discover**: View what’s up for sale around campus (Amazon-style).
- 📱 **Mobile-first design**: Built as a progressive web app or native mobile app for quick access.
- dominos

---

## 👥 Who is it for?

- **Seniors** selling used items before graduating
- **Freshers** looking for cheaper alternatives
- **Campus groups & clubs** managing bulk orders or selling merch
- **Everyone** who wants a simple way to trade within IIT Bhilai

---

## 🤝 How to Contribute

Want to contribute to this idea? Feel free to fork the repo once it's set up, or reach out on campus/Discord/OpenLake.

Let’s build something useful together for IIT Bhilai! 💙

Maintainer : @Rahul5977

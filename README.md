# SocioConnect 🚀

> Connect • Share • Explore

SocioConnect is a modern full-stack social media web application built using the MERN stack. It allows users to connect with others, create and interact with posts, follow users, explore trending content, and experience a beautiful modern UI inspired by popular social platforms.

---

## ✨ Features

### 🔐 Authentication & Security

* User Registration & Login
* JWT Authentication
* Protected Routes
* Persistent Sessions
* Password Encryption with bcryptjs

### 👤 User Profiles

* Custom User Profiles
* Avatar Upload
* Bio, Website & Location
* Edit Profile

### 📝 Posts & Feed

* Create, Edit & Delete Posts
* Image Upload Support
* Hashtags
* Infinite Scrolling Feed
* Latest, Trending & Following Feeds

### ❤️ Social Features

* Like & Unlike Posts
* Save/Bookmark Posts
* Follow & Unfollow Users
* Comment System
* Nested Replies

### 🔍 Search

* Search Users
* Search Posts
* Search Hashtags

### 🌙 UI/UX

* Modern Responsive Design
* Dark Mode
* Glassmorphism UI
* Mobile Friendly

### 🛡️ Admin Features

* Admin Dashboard
* User Management
* Post Moderation

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Redux Toolkit
* React Router
* Axios
* Lucide React

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

## Authentication

* JWT
* bcryptjs

## File Uploads

* Multer

---

# 📁 Project Structure

```bash
socialconnect/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── styles/
│   │   └── utils/
│   │
│   ├── public/
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/socialconnect.git
cd socialconnect
```

---

# ⚙️ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file inside backend folder:

```env
PORT=5001

MONGO_URI=your_mongodb_atlas_uri

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

---

# 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```bash
http://localhost:5173
```

---

# 🌐 MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create Cluster
3. Add Database User
4. Add IP Address:

   ```txt
   0.0.0.0/0
   ```
5. Copy connection string into `.env`

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/socialconnect
```

---

# 📸 Screenshots

## Login Page

Modern authentication UI with glassmorphism effect.

## Home Feed

Trending feed with infinite scrolling.

## Profile Page

User profile with posts and followers.

---

# 🔒 Security Features

* Hashed Passwords
* JWT Authentication
* Protected APIs
* Role-based Authorization
* Input Validation

---

# 📱 Responsive Design

SocioConnect works smoothly on:

* Desktop
* Tablet
* Mobile Devices

---

# 🚀 Future Improvements

* Real-time Chat
* Notifications
* Stories/Reels
* Video Upload
* OAuth Login
* AI Recommendations

---

# 📦 Deployment

## Frontend

Deploy on:

* Vercel
* Netlify

## Backend

Deploy on:

* Render
* Railway

---

# 👨‍💻 Author

### Ansh Sharma

Passionate Full Stack Developer & Tech Enthusiast.

---

# ⭐ Support

If you like this project:

* Give it a ⭐ on GitHub
* Share it with others
* Fork & contribute


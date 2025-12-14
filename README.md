# Frontend Developer Task

This is a simple **full-stack web application** with authentication and a dashboard. The app allows users to **register, login**, and manage tasks using **CRUD operations**.

---

## Features

* User Signup and Login
* JWT-based Authentication
* Protected Dashboard
* Create, Read, Update, Delete (CRUD) Tasks
* Logout
* Responsive UI

---

## Tech Used

* React.js
* Tailwind CSS
* Node.js
* Express.js
* MongoDB
* JWT, bcrypt

---

## How to Run

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## APIs

* POST /auth/register
* POST /auth/login
* GET /tasks
* POST /tasks
* PUT /tasks/:id
* DELETE /tasks/:id

---

## Notes

* Passwords are hashed
* Dashboard is accessible only after login
* Code is modular and scalable

---

## Submission

* GitHub repo contains frontend and backend
* APIs tested using Postman

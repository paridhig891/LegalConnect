# LegalConnect – AI Powered Lawyer-Client Platform

LegalConnect is a full-stack legal services platform designed to connect clients and lawyers through a secure and intelligent digital ecosystem.  
The platform provides role-based dashboards, case management, lawyer discovery, real-time communication, reviews, notifications, and AI-assisted legal support.

---

# 🚀 Features

## 👤 Client Features
- Secure Registration & Login
- Upload and manage legal cases
- Track case progress
- Search and filter lawyers
- Chat with lawyers
- Review and rate lawyers
- Notification center
- AI-assisted legal guidance

---

## ⚖️ Lawyer Features
- Secure Registration & Login
- Professional lawyer profile
- View and accept client cases
- Manage active cases
- Update case status and timeline
- Chat with clients
- View ratings and reviews
- Dashboard analytics

---

## 🛡️ Admin Features
- Manage platform users
- Verify lawyer accounts
- Monitor complaints
- Platform moderation
- Audit logs and analytics
- Administrative dashboard

---

# 🧠 AI Features

The platform includes AI-assisted legal support capabilities such as:

- Legal case summarization
- Case analysis assistance
- Lawyer recommendation support
- Context-aware legal guidance
- Smart legal workflow support

---

# 🏗️ Tech Stack

## Backend
- Java 21
- Spring Boot 3
- Spring Security
- JWT Authentication
- Spring Data JPA / Hibernate
- MySQL
- Maven
- Flyway Migration

---

## Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM

---

# 📂 Project Structure

```text
LegalConnect/
│
├── backend/
│   ├── src/main/java/com/legalconnect
│   │   ├── controller
│   │   ├── service
│   │   ├── repository
│   │   ├── entity
│   │   ├── dto
│   │   ├── security
│   │   ├── config
│   │   └── exception
│   │
│   └── src/main/resources
│       ├── application.properties
│       └── db/migration
│
├── frontend/
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── layouts
│   │   ├── services
│   │   └── context
│
└── README.md

# ⚙️ Backend Setup

## 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
```bash
cd LegalConnect/backend

## 2️⃣ Create MySQL Database
Open MySQL and run:
```SQL
CREATE DATABASE legalconnect;

## 3️⃣ Configure Application Properties

Open:

src/main/resources/application.properties

Add/update the following configuration:

# DATABASE CONFIGURATION
```text
spring.datasource.url=jdbc:mysql://localhost:3306/legalconnect
spring.datasource.username=root
spring.datasource.password=your_password

# JPA / HIBERNATE
```text
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true


# SERVER CONFIGURATION
```text
server.port=8080

# JWT CONFIGURATION
```text
jwt.secret=your_secret_key
jwt.expiration=86400000

# FLYWAY MIGRATION
```text
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true

# FILE UPLOAD
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

## 4️⃣ Install Maven Dependencies
```bash
mvn clean install
## 5️⃣ Run Backend Server
```bash
mvn spring-boot:run

Backend will start on:
```http
http://localhost:8080

## 6️⃣ Verify Backend Running

Open browser:
```http
http://localhost:8080

Or test APIs using Postman.
Example:
POST http://localhost:8080/api/auth/register

## 🛡️ Default Admin Account
A default admin account is automatically seeded into the database during application setup.
Use the following credentials to access the Admin Dashboard:

```text
Email: admin@legalconnect.com
Password: admin123

# 💻 Frontend Setup

## 1️⃣ Navigate to Frontend Folder

```bash
cd frontend

## 2️⃣ Install Dependencies
```bash
npm install

## 3️⃣ Run Frontend Development Server
npm run dev

Frontend will start on:
http://localhost:3000

## 4️⃣ Verify Frontend Running
Open browser:
http://localhost:5173


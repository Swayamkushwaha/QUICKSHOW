# 🎬 QuickShow

A full-stack movie ticket booking web application with admin dashboard, seat selection, and Stripe-powered payments.

🔗 **Live Demo**: [https://quickshow-q8jy.vercel.app](https://quickshow-q8jy.vercel.app)

---

## ✨ Features

### User-Facing
- **Hero Banner** — Highlights currently featured/new release films
- **Movie Listings** — Browse now-showing and upcoming releases with genre, year, runtime, and ratings
- **Movie Detail Page** — Full movie info including cast, synopsis, trailer link, and genre tags
- **Seat Selection** — Interactive seat map with Standard and Recliner pricing tiers; real-time seat availability
- **Stripe Checkout** — Secure payment via Stripe (supports INR/USD, card & Link)
- **My Tickets** — View confirmed and pending bookings with QR codes and download option
- **Favorites** — Save movies to a personal favorites list
- **Authentication** — Sign in via Google or email, powered by Clerk
- **User Profile** — Manage profile, email addresses, and connected accounts

### Admin Panel
- **Dashboard / Insights** — Live stats: total bookings, revenue, active shows, total users
- **Live Screenings** — Visual grid of currently active shows with ratings
- **Add / List Shows** — Create and manage screenings
- **List Bookings** — View and manage all user bookings

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React) |
| Auth | Clerk |
| Payments | Stripe |
| Deployment | Vercel |
| Styling | Tailwind CSS |

---

## 📸 Screenshots

### 🏠 Home Page
![Home Page](https://github.com/user-attachments/assets/9c20f233-a4aa-4e06-ac8f-84c84341bab4)

### 🔐 Login
![Login](https://github.com/user-attachments/assets/67a3ca1a-ffa6-48f3-a4c4-b5b1c668c0b5)

### 👤 User Profile
![User Profile](https://github.com/user-attachments/assets/18c7c61d-c639-4acc-aaae-64d933d1072d)

### 🛠️ Admin Dashboard
![Admin Dashboard](https://github.com/user-attachments/assets/73d730a2-3b81-4b8b-8910-6c7d36cbdd12)

### 🎬 Movie Detail
![Movie Detail](https://github.com/user-attachments/assets/95b64975-ae00-4604-ba55-f9a992ffc44c)

### 💺 Seat Selection
![Seat Selection](https://github.com/user-attachments/assets/0d4627a9-3c9b-4aad-ac22-bbfb8fcec06a)

### 💳 Stripe Checkout
![Stripe Checkout](https://github.com/user-attachments/assets/43744e0c-141c-4420-af50-d674f3c48710)

### 🎫 My Tickets
![My Tickets](https://github.com/user-attachments/assets/fb26ab96-df8a-4937-924e-37ae1aae2d5a)

---

## 📄 Pages Overview

| Page | Description |
|---|---|
| `/` | Home with hero banner and now-showing movies |
| `/movies` | Full movie listing |
| `/movies/[id]` | Movie detail with booking CTA |
| `/movies/[id]/seats` | Seat selection screen |
| `/theaters` | Theater listings |
| `/releases` | Upcoming releases |
| `/favorites` | User's saved movies |
| `/my-tickets` | Confirmed & pending bookings |
| `/admin` | Admin dashboard (protected) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Clerk](https://clerk.dev) account
- A [Stripe](https://stripe.com) account

### Installation

```bash
git clone https://github.com/Swayamkushwaha/QUICKSHOW.git
cd QUICKSHOW
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💳 Payments

Payments are processed via **Stripe Checkout** in sandbox/test mode. Use Stripe's test card:

- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

---

## 🔐 Authentication

Authentication is handled by **Clerk**. Users can:
- Sign in / sign up with Google
- Sign in / sign up with email
- Manage profile and connected accounts

---

## 🎫 Seat Pricing

| Tier | Price |
|---|---|
| Standard | $1 |
| Recliner | $9 |

---

## 📦 Deployment

The app is deployed on **Vercel**. To deploy your own:

```bash
npm run build
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## 📄 License

MIT

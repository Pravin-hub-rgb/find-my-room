# 🏠 Find My Room
- A full-stack room rental platform built with **Next.js 15 (App Router)** and **Supabase** as backend. Styled using **Tailwind CSS** and **Shadcn UI**, managed with **pnpm**. Features smooth authentication, room posting, searching, chatting, and map integration.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Supabase (Auth, Database, Storage)
- **UI**: Tailwind CSS + Shadcn UI
- **Maps**: React Leaflet + OpenStreetMap
- **Package Manager**: pnpm

## 🔥 Core Features

- **Authentication**:
  - Email/password login (via Supabase Auth)


- **Room Posting**:
  - Upload multiple room images to Supabase Storage
  - Auto-fill state, district, and locality using reverse geocoding
  - Post fields: City, District, Locality, Title, Description, Price, Room Type (BHK), Images, Address (optional)


- **Room Listings & Search**:
  - Search/filter by city, district, price, and room type
  - Rooms displayed on map with pins using React Leaflet
  - Room cards show main image, title, location, and price


- **Ratings & Reviews**:
  - Users can leave a 1–5 star rating and a short review
  - Average rating **calculated on frontend** dynamically (not stored in database)


- **User Profiles**:
  - Public user pages showing profile photo, city, rooms posted, and reviews given/received



## 🧹 Project Decisions
- **Clean and Modular Code**: Components and logic are organized neatly for maintainability `lib/` folder is used for helper functions (instead of `utils/`)
- **Room Form** is shared between create and edit flows for a consistent user experience
- **Frontend Calculations**: Ratings and other calculated data are done on the client side
- **Supabase Storage** handles all image uploads, deletions, and replacements
- **City & District Filtering** for efficient room browsing

## 📍 Setup Instructions

- **Clone the Repo** 
```bash 
git clone  cd  
```
- **Install Dependencies** 
```bash 
pnpm install 
```
- **Create **`.env.local` and add: 
```bash 
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
- **Run the Dev Server** 
```bash 
pnpm dev 
```

## 🛠️ Todo / Future Features (Optional)

- Save favorite rooms (Wishlist)
- Admin panel to manage reported listings
- Notifications for new chat messages
- SEO Optimization for better Google search ranking

## 📷 Screenshots
- (Coming Soon!)


## Made with ❤️ and lots of pnpm installs.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


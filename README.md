# DropMyMachine

A full-stack B2B marketplace connecting machine operators with location hosts. 
Instead of cold calling, operators browse verified listings posted by hotels, 
gyms, and retailers who want machines on their property.

## The Problem
Machine operators (vending, EV chargers, coffee kiosks) spend hours cold 
calling businesses to find placement locations. Businesses that want machines 
have no easy way to signal that — so both sides lose.

## The Solution
DropMyMachine flips the dynamic. Location hosts post what they want. 
Operators browse, filter, and send placement requests. No cold calling.

## Features
- Two user roles — operator and location owner with separate dashboards
- Location hosts can post machine placement listings
- Operators can browse and filter listings by city and machine type
- Request system with status tracking — pending, accepted, declined
- JWT-based authentication with role-based access control

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth
- **Deployment:** Vercel (frontend), Railway (backend)

## Getting Started

### Prerequisites
- Node.js v18+
- A Supabase account

### Installation

Clone the repository
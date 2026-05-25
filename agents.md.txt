# AGENTS.md

## Project

We are building a complete admin-controlled auction website.

This is not a marketplace. Only admins can add products and create auctions. Users can register, complete their profile, place bids, win auctions, place orders, manage addresses, and track their activity.

## Reference

Use Ofertoj.com as a functional reference for the auction flow, not as a design copy.

Useful reference ideas:
- product image gallery
- product description
- product condition
- tested/verified product notes
- starting price
- current price
- auction countdown
- bid count
- latest bids
- login required before bidding
- delivery information
- return/trust information

## Core Flow

Admin creates product → admin creates auction → user logs in → user completes required profile/order details → user places bid → highest valid bid wins → order is created → user confirms delivery → admin manages delivery.

## Required User Information

Before a user can place bids or orders, they must have valid profile/delivery information:

- full name
- country
- city
- address
- phone number

This prevents random/anonymous bidding and helps the admin know who the buyer is.

## User Features

Users can:

- register/login with Supabase Auth
- update profile information
- change password
- add/change delivery address
- browse auctions
- place bids
- see auctions they bid on
- see auctions they won
- see orders they placed
- update order address when allowed
- track order status

## Admin Features

Admins can:

- login to admin dashboard
- add/edit products
- upload product images
- add product description
- set product condition
- create auctions
- set initial price
- set auction duration/start/end time
- track ongoing bids
- see who placed each bid
- cancel suspicious bids
- cancel auctions
- relist auctions
- manage winners
- manage orders
- update delivery/order status
- manage users
- view audit logs

## Main Auction Rules

- Only admins can create products and auctions.
- Users must be logged in to bid.
- Users must complete required profile/delivery information before bidding.
- Bids must be validated server-side.
- Users must never write bids directly from the frontend without validation.
- A bid must be higher than the current bid by the minimum increment.
- Highest valid bid at auction end wins.
- Admin can cancel suspicious bids only with a reason.
- Admin should not secretly edit bid amounts.
- Important actions should be logged.

## Main Pages

Public:
- Home
- Auctions
- Auction Detail
- Categories
- Ending Soon
- How It Works
- Winners
- FAQ
- Contact

User Dashboard:
- Overview
- My Bids
- Won Auctions
- Orders
- Profile
- Addresses
- Change Password

Admin Dashboard:
- Overview
- Products
- Create/Edit Product
- Auctions
- Create/Edit Auction
- Bids
- Orders
- Users
- Categories
- Audit Logs
- Settings

## Tech Stack

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase Database/PostgreSQL
- Supabase Storage for product images
- Supabase Realtime if needed for live bid updates
- Supabase Row Level Security policies
- Vercel deployment

Do not use Prisma.

## Supabase Rules

Use Supabase for:

- authentication
- database
- image storage
- row level security
- admin/user role handling
- realtime auction updates if needed

All sensitive actions should be protected by Supabase RLS policies and/or server-side logic.

## Do Not Build

Do not build:
- seller accounts
- public product posting
- seller payouts
- crypto
- paid bid/gambling mechanics
- mobile app
- complex marketplace disputes
- Prisma setup

## Milestone File Rules

The `milestone.md` file is the project memory and progress tracker.

Before starting any work, always read:

1. `AGENTS.md`
2. `milestone.md`

After every meaningful task or completed milestone, update `milestone.md`.

The milestone file should track:

- current project status
- completed work
- current active task
- next tasks
- important decisions
- open questions
- notes for future work

Keep `milestone.md` short, practical, and updated. Do not overfill it with unnecessary details.

Do not leave `milestone.md` empty.

## Workflow

Before coding:
1. Read `AGENTS.md`.
2. Read `milestone.md`.
3. Work on the current milestone only.
4. Keep code clean and simple.
5. Update `milestone.md` after each milestone.
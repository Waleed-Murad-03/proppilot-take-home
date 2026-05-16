# PropPilot Take-Home — Junior Full-Stack

This project is a mini real estate inbox system built with React, TypeScript, Supabase, and Tailwind CSS.

It allows public users to submit contact inquiries to real estate agencies through a public form, while authenticated agents can log in and manage incoming contacts in real time.

---

# Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Supabase
  - Database
  - Authentication
  - Row Level Security (RLS)
  - Realtime
- React Router
- Vercel (deployment)

---

# Features

## Public Contact Form

Public route:

```bash
/c/:agencySlug
```

Examples:

```bash
/c/dubai-homes
/c/luxury-estates
```

Users can submit:

- Name
- Email
- Message

The contact is automatically linked to the correct agency using the agency slug.

---

## Authentication

Agents can log in using Supabase Auth with email and password.

Example demo accounts:

```txt
agent1@example.com
Password123!

agent2@example.com
Password123!
```

---

## Inbox Dashboard

Authenticated agents can access:

```bash
/inbox
```

The inbox displays:

- Name
- Email
- Message
- Status
- Created date

Agents can update contact status:

- new
- contacted
- discarded

---

## Realtime Updates

When a new contact is submitted through the public form, it appears instantly in the inbox without refreshing the page.

Supabase realtime subscriptions are used for this functionality.

---

# Multi-Tenant Security (RLS)

This project uses Supabase Row Level Security policies to ensure agencies can only access their own contacts.

Two audiences interact with the same `contacts` table:

## Anonymous Users

Anonymous users can:

- Read agencies by slug
- Submit new contacts

Anonymous users cannot:

- Read contacts
- Update contacts

## Authenticated Agents

Authenticated users can:

- Read contacts belonging to their agency
- Update contacts belonging to their agency

Authenticated users cannot:

- Access contacts from other agencies

Agency access is enforced at the database level using RLS policies, not in the frontend application.

---

# Preventing Realtime Duplicates

The inbox first fetches contacts from the database and then subscribes to realtime inserts.

To avoid duplicate contacts appearing in the UI, the app checks whether the incoming realtime contact already exists in the current state before inserting it.

Example logic:

```ts
const alreadyExists = currentContacts.some(
  (contact) => contact.id === newContact.id,
);
```

---

# Local Setup

## 1. Clone the repository

```bash
git clone <repo-url>
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

## 4. Start development server

```bash
npm run dev
```

---

# Database Tables

The project uses three main tables:

- `agencies`
- `agency_members`
- `contacts`

---

# What I Left Out

I intentionally kept the project minimal and focused on the task requirements.

I did not add:

- Search/filtering
- Pagination
- Advanced CRM features
- File uploads
- Notifications
- Analytics

The goal was to keep the implementation clean and focused on:

- Authentication
- Multi-tenant security
- Realtime functionality
- Inbox management

---

# AI Usage

AI tools were used during development for:

- Planning the project structure
- Reviewing Supabase RLS logic
- Debugging TypeScript issues
- Improving component structure

I still manually reviewed and adjusted the implementation, especially around:

- Row Level Security
- Realtime subscriptions
- Multi-tenant access control

---

# Demo Accounts

## Agency 1 — Dubai Homes

```txt
Email: agent1@example.com
Password: Password123!
```

## Agency 2 — Luxury Estates

```txt
Email: agent2@example.com
Password: Password123!
```

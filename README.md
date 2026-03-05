# SignVault — Frontend

> Enterprise Document Signature SaaS built with React + TypeScript

**Live Demo:** https://document-signature-frontend-cf8g.vercel.app

---

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- dnd-kit (drag & drop)
- react-pdf
- pdf-lib
- Axios
- React Hook Form + Zod
- JWT (access + refresh tokens)

---

## Features

- JWT Authentication (login/register) with refresh tokens
- PDF Upload & Preview
- Drag-and-drop signature field placement
- 4 signature font styles
- Company stamp upload
- Self-sign flow with preview
- Multi-signer email invites
- Tokenized signing links for external signers
- Real-time signing status dashboard
- Audit trail timeline
- Dark navy UI

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/shishvishwakarma995-png/document-signature-frontend.git
cd document-signature-frontend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000
```

For production, set `VITE_API_URL` to your Render backend URL.

### Run Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
src/
├── hooks/
│   ├── useAuth.ts        # Auth context + JWT refresh
│   └── useTheme.ts
├── pages/
│   ├── Landing.tsx       # Landing page
│   ├── Login.tsx         # Login
│   ├── Register.tsx      # Register
│   ├── Dashboard.tsx     # Document management
│   ├── SignatureEditor.tsx # Drag-drop field editor
│   ├── SelfSign.tsx      # Self-signing flow
│   ├── SignPage.tsx      # External signer page
│   ├── SignersStatus.tsx  # Signing status tracker
│   └── AuditTrail.tsx    # Audit logs
├── services/
│   └── api.ts            # Axios + JWT refresh interceptor
└── App.tsx
```

---

## Deployment

Deployed on **Vercel** with automatic GitHub integration.

---

## Backend

See: https://github.com/shishvishwakarma995-png/document-signature-backend

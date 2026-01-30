# WETAX Codebase Overview

**Last Updated:** 2024  
**Purpose:** Context handoff for AI assistants and developers

---

## 1. Tech Stack

### Frontend (`Wetax-master/`)
- **Framework:** React Native 0.81.1 with Expo 54.0.1
- **Language:** TypeScript 5.9.2
- **State Management:** 
  - `@tanstack/react-query` 5.87.4 (server state)
  - React Context (client state: `User.context.tsx`, `TaxReturn.context.tsx`)
- **Forms:** `monocle-ts` 2.3.13 (Lens pattern), `fp-ts` 2.16.11
- **Navigation:** `@react-navigation/native` 7.1.17
- **Styling:** `styled-components` 6.1.19
- **Auth:** Firebase Auth, Apple Sign-In, Google Sign-In
- **API Client:** `openapi-typescript-codegen` 0.29.0 (generated from backend swagger.json)

### Backend (`Wetax-app-server-main/`)
- **Runtime:** Node.js with Express 5.1.0
- **Language:** TypeScript 5.9.2
- **Database:** MongoDB 6.19.0 (native driver, no Prisma/ORM)
- **API Framework:** TSOA 6.6.0 (generates OpenAPI 3.0 spec + routes)
- **Auth:** JWT (`jsonwebtoken` 9.0.2) via `x-access-token` header
- **PDF:** `pdf-lib` 1.17.1 (fills PDF forms)
- **AI/OCR:** OpenAI API, AWS Textract (for document extraction)
- **XML:** `xmlbuilder2` 4.0.3 (eCH-0119 export)

### Database Schema
- **Collections:** `users`, `taxReturns`, `adminActivities`
- **No Prisma:** Direct MongoDB driver usage
- **User Model:** `_id`, `ahvNummer`, `phoneNumber`, `email`, `validated`, `role`, `isSuperAdmin`
- **TaxReturn Model:** `_id`, `userId`, `year`, `data: TaxReturnData`, `pdf`, `archived`, `validated`

### Key Integrations
- **Twilio:** SMS verification codes (fallback: hardcoded `123456` in dev)
- **Firebase:** Mobile app authentication
- **AWS S3/Textract:** Document storage and OCR
- **OpenAI:** PDF/image text extraction and structured data parsing

---

## 2. Current Architecture

### Main Directories
```
Wetax-master/
├── src/
│   ├── view/
│   │   ├── authenticated/     # Post-login screens
│   │   │   ├── taxReturn/     # Tax form wizard
│   │   │   └── user/          # Profile, subscription
│   │   └── unauthenticated/   # Login, registration
│   ├── components/            # Reusable UI (forms, inputs)
│   ├── context/               # React Context (User, TaxReturn)
│   ├── openapi/               # Generated API client (DO NOT EDIT)
│   └── shared/                # Utilities, constants
│
Wetax-app-server-main/
├── src/
│   ├── api/                   # Controllers & services
│   ├── ech0119/               # XML export (Swiss tax standard)
│   ├── compute*.ts            # Tax calculation logic
│   ├── pdf.ts                 # PDF form filling
│   ├── db.ts                  # MongoDB connection
│   └── types.ts               # TypeScript types
```

### Data Flow
```
User Input (React Native Form)
  ↓
Form Component (lens-based, monocle-ts)
  ↓
Local State Update (TaxReturn Context)
  ↓
Submit → React Query Mutation
  ↓
OpenAPI Client → HTTP POST /api/v1/tax-return/{id}/update
  ↓
Backend: api.controller.ts → api.service.ts
  ↓
MongoDB: taxReturns collection update
  ↓
GET /api/v1/{taxReturnId}/tax-amount
  ↓
Backend: computeTaxAmount() → computeTaxReturn() → computeTaxes.ts
  ↓
Response: { grossIncome, deductableAmount, taxableIncome, totalTaxes }
  ↓
React Query Cache
  ↓
UI Display (tax amount, breakdown)
```

### Key Files
- **Frontend Entry:** `Wetax-master/App.tsx` (navigation, providers)
- **Backend Entry:** `Wetax-app-server-main/src/server.ts` (Express setup)
- **Tax Calculation:** `Wetax-app-server-main/src/computer.ts` (orchestrator)
- **PDF Export:** `Wetax-app-server-main/src/pdf.ts` (form filling)
- **XML Export:** `Wetax-app-server-main/src/ech0119/xml-generator.ts` (eCH-0119)

---

## 3. Implemented Features

### Authentication
- ✅ **Phone + AHV registration:** SMS verification (Twilio, dev fallback)
- ✅ **Email login:** Direct JWT token generation
- ✅ **Apple/Google Sign-In:** Frontend integration (Firebase)
- ✅ **JWT middleware:** `authentication.ts` validates tokens

### Tax Form Sections
- ✅ **Person Data:** Name, DOB, address, marital status, religion, profession
- ✅ **Income:** Employment income (`geldVerdient`), multiple employers
- ✅ **Deductions:** 
  - Work expenses (commuting, meals, OEV)
  - Education costs (`inAusbildung`)
  - Insurance premiums
  - Pillar 2/3a contributions
  - Donations
- ✅ **Children:** In-household and external (`kinderImHaushalt`, `kinderAusserhalb`)
- ✅ **Assets:** Bank accounts, cash, stocks, crypto, motor vehicles
- ✅ **Bank Details:** Refund IBAN

### Calculations Working
- ✅ **Federal income tax:** Hardcoded progressive brackets
- ✅ **Cantonal tax:** **Zurich only** (hardcoded brackets with religion multiplier)
- ✅ **Wealth tax:** Hardcoded brackets
- ✅ **Deductions:** Professional, education, insurance, donations
- ✅ **Net income:** Income - deductions
- ✅ **Taxable income:** Net - donations

### Export Capabilities
- ✅ **PDF Generation:** Fills Swiss tax form template (`template.pdf`)
- ✅ **eCH-0119 XML:** Swiss tax standard export (Zurich-focused)
- ✅ **Real-time calculation:** Tax amount updates on form changes

### Admin Features
- ✅ **Admin Panel:** HTML/JS interface (`public/admin-panel.html`)
- ✅ **Dashboard Stats:** User counts, tax return stats
- ✅ **PDF Upload:** AI-powered tax document extraction (OpenAI/Textract)

---

## 4. In-Progress Features

### Partially Built
- **Real Estate Tax (`liegenschaften`):** Type exists in `types.ts:298-303` but `data: {}` empty
- **Multi-canton support:** Only Zurich hardcoded; no canton selection logic
- **ECH0119 Extended Mapping:** Extended fields documented but not all implemented

### Known TODOs/FIXMEs
- `api.controller.ts:104` - `// TODO - fix type` (UpdateTaxReturnBody should not be `any`)
- `computeDeductible.ts:162` - `// TODO: Implement the total income calculation` (for donations)
- `authentication.ts:45` - `// TODO,` (JWT verify callback typing)

---

## 5. Feature Flags / Environment Config

### Canton-Specific Logic
- **Hardcoded Canton:** `pdf.ts:38` → `'Zürich'`, `ech0119/mappers.ts:32` → `canton: 'ZH'`
- **Tax Rates:** Hardcoded in `computeTaxes.ts:44-77` (Zurich only)
- **No Config System:** All tax brackets are in code, not database/config

### Environment Variables
- `MONGO_URI`, `DB_NAME` - Database connection
- `JWT_SECRET` - Token signing
- `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` - Admin login
- `OPENAI_API_KEY` - Document extraction
- AWS credentials (S3, Textract)

### Dev vs Production
- **Dev:** `x-access-token: 'test-token'` bypasses auth (sets dummy user)
- **SMS:** Falls back to `'123456'` if Twilio fails in dev

---

## 6. Known Limitations

### What Doesn't Work Yet
- ❌ **Real estate tax:** Type exists but no calculation logic
- ❌ **Multi-canton:** Only Zurich supported (25 cantons missing)
- ❌ **Municipal tax variations:** No municipality-specific logic
- ❌ **Partner 2 calculations:** Married couples partially supported
- ❌ **Self-employment:** Not implemented (employee-focused)

### Technical Debt
- **Hardcoded Values:** Tax brackets, canton, municipality not configurable
- **Type Safety:** `api.controller.ts` uses `any` for update body
- **Error Handling:** Many functions lack try/catch blocks
- **No Database Migrations:** Direct MongoDB writes, no schema versioning
- **OpenAPI Regeneration:** Must run `npm run openapi` after backend changes

### Scalability Concerns
- **Single Canton:** Cannot scale to all 26 Swiss cantons without refactoring
- **Hardcoded Tax Rates:** Changes require code deployment (not config-driven)
- **No Caching:** Tax calculations run on every request
- **PDF Template:** Single hardcoded template (not dynamic per canton)

### Architecture Constraints
- **Frontend is Thin Client:** All tax logic in backend (cannot add calculations in frontend)
- **OpenAPI Coupling:** Frontend must regenerate client after backend API changes
- **No Prisma/ORM:** Direct MongoDB driver (no type-safe queries)

---

## Quick Reference

### Generate OpenAPI Client
```bash
cd Wetax-master
npm run openapi  # Fetches from http://localhost:3000/swagger.json
```

### Start Development
```bash
# Backend
cd Wetax-app-server-main
npm run dev  # Runs nodemon + TSOA spec generation

# Frontend
cd Wetax-master
npm start  # Expo dev server
```

### Key Endpoints
- `POST /api/v1/register` - User registration
- `POST /api/v1/login` - Phone login (sends SMS code)
- `POST /api/v1/login-email` - Email login (returns JWT)
- `GET /api/v1/tax-return` - List user's tax returns
- `POST /api/v1/tax-return/{id}/update` - Update tax data
- `GET /api/v1/{taxReturnId}/tax-amount` - Calculate taxes
- `GET /api/v1/tax-return/{id}/pdf` - Generate PDF
- `GET /api/v1/tax-return/{id}/ech0119` - Generate XML

---

**Note:** This is a Swiss tax application (`AHV` = social security number, `Kanton` = canton, `Gemeinde` = municipality). All tax calculations follow Swiss federal and cantonal rules (currently Zurich only).





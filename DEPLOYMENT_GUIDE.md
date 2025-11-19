# CaseGuard - Multi-Firm Legal Document Audit System

## 🎯 Overview

**CaseGuard** is a professional document audit service for law firms. You scan your clients' case files through their CasePeer accounts to identify missing or critical documents - WITHOUT storing any actual files.

### Production URL
https://legal-file-auditor.vercel.app

---

## ✨ Key Features

✅ **Multi-Firm Management** - Service multiple law firm clients from one dashboard
✅ **Zero Document Storage** - Only metadata, complete HIPAA compliance
✅ **Military-Grade Encryption** - AES-256-GCM for all API credentials
✅ **Bulk Scanning** - Process hundreds of cases in minutes
✅ **Real-time AI Analysis** - GPT-4 powered document classification
✅ **Demo Mode** - Test with 3 sample cases before connecting live data
✅ **Export Reports** - JSON/CSV/Excel (coming soon)
✅ **Secure Access** - Password-protected internal tool

---

## 🏗️ Architecture

```
Your Dashboard
     ↓
Select Firm → Fetch Cases (CasePeer API)
     ↓
Process Documents (in memory)
     ↓
Generate Audit Report
     ↓
Return Results (no storage)
     ↓
Discard All Data
```

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Serverless API Routes (Vercel)
- **Database**: PostgreSQL (Prisma ORM) - only for firm configs & audit logs
- **Auth**: Iron-session (internal password-based)
- **Encryption**: Node.js crypto (AES-256-GCM)
- **AI**: OpenAI GPT-4o
- **Hosting**: Vercel

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd legal-file-auditor
npm install
```

### 2. Set Up Environment Variables

Create `.env.local`:

```bash
# Database (Choose one option below)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Security Keys
ENCRYPTION_KEY="<generate with command below>"
ADMIN_PASSWORD="your_secure_password"
SESSION_SECRET="at_least_32_characters_long_random_string"

# OpenAI (for document classification)
OPENAI_API_KEY="sk-..."

# App Config
NEXT_PUBLIC_APP_NAME="CaseGuard"
CASEPEER_ENABLED=false
NEXT_PUBLIC_CASEPEER_ENABLED=false
```

### 3. Generate Encryption Key

```bash
npx tsx scripts/generate-encryption-key.ts
# Copy the output to ENCRYPTION_KEY in .env.local
```

### 4. Set Up Database

**Option A: Vercel Postgres (Recommended)**
```bash
vercel link  # Link to your Vercel project
vercel env pull  # Get DATABASE_URL automatically
```

**Option B: Local PostgreSQL**
```bash
createdb caseguard_dev
# Update DATABASE_URL in .env.local
```

**Option C: Railway/Supabase/Neon**
- Create database → Copy connection string

### 5. Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login)

**Default login:** Password from `ADMIN_PASSWORD` in `.env.local`

---

## 📦 Database Schema

### Firms Table
```sql
- id (string) - Unique identifier
- name (string) - Law firm name
- contactEmail (string, optional)
- contactPhone (string, optional)
- casepeerApiUrl (string) - API endpoint
- casepeerApiKey (string) - ENCRYPTED
- active (boolean) - Active status
- createdAt (datetime)
- updatedAt (datetime)
- lastScannedAt (datetime, optional)
```

### AuditLogs Table
```sql
- id (string)
- firmId (string) - Foreign key to Firms
- scanType (string) - "full_firm" | "single_case"
- casesScanned (int)
- documentsAnalyzed (int)
- criticalMissing (int)
- requiredMissing (int)
- averageScore (float)
- status (string) - "in_progress" | "completed" | "failed"
- errorMessage (string, optional)
- startedAt (datetime)
- completedAt (datetime, optional)
```

**NO DOCUMENTS ARE STORED** - Only scan metadata and results.

---

## 🔐 Security Features

### 1. Encrypted API Credentials
```typescript
// All CasePeer API keys are encrypted before database storage
const encrypted = encrypt(apiKey);  // AES-256-GCM
// Decrypted only during active scans, in memory
```

### 2. Session-Based Auth
- HttpOnly cookies (no XSS attacks)
- Secure flag in production
- 24-hour expiration
- Server-side validation

### 3. Zero Document Storage
- Documents fetched from CasePeer
- Processed in memory
- Results generated
- Data discarded immediately
- **Zero compliance risk**

### 4. Audit Trails
- Every scan logged (no PII)
- Tracks: Firm ID, scan type, timestamp
- Performance metrics only

---

## 📖 User Guide

### Adding a Law Firm

1. Log in → Click "Manage Firms"
2. Click "Add New Firm"
3. Enter:
   - Firm Name
   - Contact Email (optional)
   - Contact Phone (optional)
   - CasePeer API URL (e.g., `https://api.casepeer.com/v1`)
   - CasePeer API Key
4. Submit → Key is encrypted and stored securely

### Scanning Cases

#### Via API (Bulk Scan All Cases)

```bash
POST /api/scan/firm
Content-Type: application/json
Authorization: <session cookie>

{
  "firmId": "clxxx..."
}

# Response:
{
  "success": true,
  "auditLogId": "clyyy...",
  "summary": {
    "totalCases": 247,
    "totalDocuments": 3891,
    "averageScore": 82,
    "criticalIssues": 15,
    "requiredMissing": 42
  },
  "cases": [
    {
      "caseId": "case-001",
      "caseNumber": "PI-2024-001",
      "clientName": "John Doe",
      "phase": "treatment",
      "score": 75,
      "criticalMissing": 1,
      "requiredMissing": 2,
      "recommendations": [...]
    },
    ...
  ]
}
```

#### Via API (Single Case Scan)

```bash
POST /api/scan/case
Content-Type: application/json

{
  "firmId": "clxxx...",
  "caseId": "case-001"
}
```

### Demo Mode

3 built-in demo cases when `CASEPEER_ENABLED=false`:

1. **Sarah Johnson** - Auto Accident (65% complete)
2. **Michael Rodriguez** - Premises Liability (85% complete)
3. **Jennifer Martinez** - Auto Accident (25% complete)

Perfect for demonstrations!

---

## 📊 Document Requirements Checklist

### Intake Phase
- ✅ Client Intake Form (Critical)
- ✅ Fee Agreement (Critical)
- ✅ Medical Authorization / HIPAA (Critical)

### Treatment Phase
- ✅ Medical Records (Required)
- ✅ Medical Bills (Required)
- ✅ Police Report (Required if accident)
- ✅ Incident Photos (Recommended)

### Demand Phase
- ✅ Demand Letter (Critical)
- ✅ Complete Medical Records (Required)
- ✅ Itemized Medical Bills (Required)
- ✅ Wage Loss Documentation (Recommended)

### Litigation Phase
- ✅ Complaint/Petition (Critical)
- ✅ Discovery Documents (Required)
- ✅ Expert Reports (Required)
- ✅ Deposition Transcripts (Recommended)

### Settlement Phase
- ✅ Settlement Agreement (Critical)
- ✅ Release Forms (Critical)
- ✅ Closing Statement (Required)

**Configure your own:** Edit `lib/document-requirements.ts`

---

## 🎨 UI/UX Design Principles

Built following professional web design and UX psychology best practices:

### Accessibility (WCAG AA)
- ✅ Minimum 16px font size (no 12px)
- ✅ 44px+ touch targets for buttons
- ✅ High contrast ratios
- ✅ Clear visual hierarchy
- ✅ Screen reader compatible

### Color Psychology
- 🟢 Green → Trust, completion, success
- 🟡 Amber → Caution, needs attention
- 🔴 Red → Urgent, critical issues
- 🔵 Blue → Professional, trustworthy (brand)

### Empathy-First Design
- Clear error messages
- No jargon
- Instant feedback
- Progress indicators
- Human touch (no over-polished AI feel)

---

## 🚢 Production Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Connect Vercel**
- Go to [vercel.com](https://vercel.com)
- Import GitHub repository
- Configure project settings

3. **Add Environment Variables**

Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=<64-char-hex>
ADMIN_PASSWORD=<strong-password>
SESSION_SECRET=<32+-char-string>
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_NAME=CaseGuard
```

4. **Run Database Migration**

```bash
# After first deployment
npx prisma migrate deploy
```

5. **Deploy**
```bash
vercel --prod
```

### Custom Domain (Optional)

```bash
vercel domains add caseguard.yourdomain.com
# Follow Vercel's DNS instructions
```

---

## 🔧 API Reference

### Authentication Endpoints

**POST /api/auth/login**
```json
{ "password": "admin_password" }
→ Sets session cookie
```

**POST /api/auth/logout**
```json
{}
→ Destroys session
```

**GET /api/auth/check**
```json
→ { "isAuthenticated": true }
```

### Firms Management

**GET /api/firms**
List all firms

**POST /api/firms**
Create new firm

**GET /api/firms/[id]**
Get firm details + audit history

**PUT /api/firms/[id]**
Update firm

**DELETE /api/firms/[id]**
Delete firm (cascade audit logs)

### Scanning

**POST /api/scan/firm**
Bulk scan all cases (up to 5 min timeout)

**POST /api/scan/case**
Scan single case (60 sec timeout)

### Demo Data (Demo Mode Only)

**GET /api/cases**
Get demo cases

**GET /api/cases/[id]/audit**
Get audit report

---

## 🛠️ Customization

### Change Branding

```bash
# Update app name
NEXT_PUBLIC_APP_NAME="Your Company Name"

# Update logo (app/page.tsx line 144)
<Scale className="..." /> → <YourLogo />

# Update colors (tailwind.config.js)
colors: {
  primary: { ... }
}
```

### Add Document Types

Edit `types/index.ts`:
```typescript
export type DocumentType =
  | 'existing_type'
  | 'your_new_type';  // Add here
```

Then update `lib/document-requirements.ts` with the new requirement.

### Adjust Scoring

Edit `lib/audit-engine.ts`:
```typescript
const weights = {
  critical: 10,    // Change these
  required: 5,
  recommended: 2,
  optional: 1,
};
```

---

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Test connection
npx prisma db push

# View in browser
npx prisma studio

# Reset (WARNING: deletes all data)
npx prisma migrate reset
```

### Encryption Key Error

```bash
# Generate new key
npx tsx scripts/generate-encryption-key.ts

# Update .env.local
ENCRYPTION_KEY="new_key_here"
```

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### CasePeer API Issues

1. Verify API key in CasePeer dashboard
2. Check URL format: `https://api.casepeer.com/v1`
3. Test connection (admin dashboard will show errors)
4. Check CasePeer rate limits

---

## 📈 Performance

### Bulk Scanning
- **Rate Limiting**: 500ms delay between API pages
- **Timeout**: 5 minutes max (configurable)
- **Batch Size**: 100 cases per page
- **Processing**: Sequential (prevents API overload)

### Database
- **Indexes**: firmId, active, startedAt
- **Queries**: Optimized with Prisma
- **Size**: Minimal (no documents stored)

### Caching
- No caching (stateless architecture)
- Session caching via iron-session only

---

## 🎯 Roadmap

- [ ] Export to CSV/Excel/PDF
- [ ] Email reports to firm contacts
- [ ] Scheduled automatic scans (cron jobs)
- [ ] Webhook notifications
- [ ] Multi-user access with roles
- [ ] Custom checklists per firm
- [ ] Integration with Clio, MyCase, LexisNexis
- [ ] Mobile app for attorneys
- [ ] AI recommendations (GPT-4 powered)
- [ ] Benchmark scoring across firms

---

## 📞 Support

### Monitoring

- Vercel logs for errors
- Database size (audit logs)
- API usage (OpenAI, CasePeer)

### Backup

```bash
# Backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20250119.sql
```

### Updates

```bash
# Dependencies
npm update

# Database schema
npx prisma migrate dev --name update_description
```

---

## 📄 License & Credits

**Built with:**
- Next.js, React, TypeScript
- Prisma ORM, PostgreSQL
- OpenAI GPT-4
- Tailwind CSS, shadcn/ui

**Design Philosophy:**
- Vitaly Friedman's Web Design Methodology
- UX Psychology Best Practices
- WCAG AA Accessibility Standards
- Empathy-first design approach

**Version**: 2.0.0 (Multi-Firm Edition)
**Last Updated**: 2025-01-19
**Status**: Production Ready

---

## 🎬 Quick Reference

| Item | URL/Value |
|------|-----------|
| **Production URL** | https://legal-file-auditor.vercel.app |
| **Login Page** | /login |
| **Admin Dashboard** | /admin |
| **Main Dashboard** | / |
| **Recommended Name** | CaseGuard |
| **Database Provider** | Vercel Postgres (recommended) |

### Pre-Deployment Checklist
- [ ] PostgreSQL database created
- [ ] `DATABASE_URL` configured
- [ ] `ENCRYPTION_KEY` generated (64 chars)
- [ ] `ADMIN_PASSWORD` set (strong password)
- [ ] `SESSION_SECRET` set (32+ chars)
- [ ] `OPENAI_API_KEY` added
- [ ] Prisma migrations completed
- [ ] Dev server starts successfully
- [ ] Login works
- [ ] Demo cases load
- [ ] Firm creation works
- [ ] Encryption tested

---

**Ready to Deploy!** 🚀

Your multi-firm legal document audit system is production-ready. Deploy to Vercel and start onboarding law firm clients.

For questions or custom development, contact your development team.

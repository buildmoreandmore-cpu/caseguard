# CaseGuard Demo Guide

## 🎯 Demo Scenario Overview

This demo showcases a multi-firm document audit system with realistic data showing different client lifecycle stages.

## 🏢 Demo Firms

### 1. **Smith & Associates Law Firm**
*Recently Onboarded Client - Needs Attention*

**Timeline:**
- ✅ Added 3 hours ago
- 🔍 First scan completed 10 minutes ago
- 📊 Status: Active

**Stats:**
- **15 cases** with document files
- **247 documents** analyzed
- **Average Score:** 76.5%
- **Critical Issues:** 8 missing critical documents
- **Required Missing:** 12 documents

**Demo Story:**
Smith & Associates just signed up this morning. They ran their first bulk scan and discovered significant compliance gaps. This is a perfect example of a new client who needs immediate attention to bring their case files up to standard.

**What to Show:**
1. Click on "Smith & Associates" card on dashboard
2. View the 8 cases with critical missing documents
3. Click "Scan All Cases" to demonstrate the scanning process
4. Show individual case audit reports with specific missing documents

---

### 2. **Johnson Legal Group**
*Established Client - Success Story*

**Timeline:**
- ✅ Added 30 days ago
- 🔍 Multiple scans showing improvement
- 📊 Status: Active

**Scan History:**
1. **Initial Scan** (30 days ago)
   - Score: 73.8%
   - Critical: 12 issues
   - Required: 18 missing

2. **Follow-up Scan** (15 days ago)
   - Score: 85.2% (+11.4%)
   - Critical: 5 issues
   - Required: 8 missing

3. **Latest Scan** (1 day ago)
   - Score: 92.3% (+7.1%)
   - Critical: 2 issues
   - Required: 5 missing

**Demo Story:**
Johnson Legal Group is an established client showing dramatic improvement. Started with poor compliance (73.8%) and through consistent monitoring, they've reached near-perfect compliance (92.3%) in just 30 days.

**What to Show:**
1. Click on "Johnson Legal Group" card
2. View the scan history showing improvement trend
3. Only 2 critical issues remaining (down from 12)
4. Demonstrate how the system helps track progress

---

### 3. **Martinez & Partners LLP**
*Inactive Client - Historical Reference*

**Timeline:**
- ✅ Added 90 days ago
- 🔍 Last scan 45 days ago
- ⏸️ Status: Inactive (churned)

**Last Scan:**
- **8 cases** reviewed
- **142 documents** analyzed
- **Average Score:** 58.3%
- **Critical Issues:** 15
- **Required Missing:** 22

**Demo Story:**
Martinez & Partners was a client who churned due to poor compliance. Their last scan showed severe issues (58.3% compliance). This demonstrates the importance of early intervention and the consequences of ignoring document gaps.

**What to Show:**
1. Toggle "Show All" to reveal inactive firms
2. View Martinez & Partners with "Inactive" badge
3. Historical data preserved for reference
4. Example of a client who didn't address compliance issues

---

## 🎬 Demo Script

### Part 1: Dashboard Overview (2 minutes)
```
1. Login with password: CaseGuard2025
2. Show main dashboard with firm cards
3. Point out statistics:
   - 2 Active Firms
   - 10 Total Issues (8 from Smith, 2 from Johnson)
   - 84% Average Score across firms
4. Explain hybrid view (active by default)
```

### Part 2: New Client Onboarding (3 minutes)
```
1. Click "Smith & Associates" card
2. Show recent scan results:
   - Scan completed 10 minutes ago
   - 15 cases reviewed
   - 8 critical issues found
3. Scroll through cases with missing documents
4. Click "View Audit Report" on a case
5. Show specific missing documents:
   - Police Report
   - Medical Records
   - Witness Statements
6. Return to firm page
7. Click "Scan All Cases" to demonstrate re-scanning
8. Show real-time progress indicator
```

### Part 3: Success Story (2 minutes)
```
1. Return to dashboard
2. Click "Johnson Legal Group" card
3. Highlight improvement metrics:
   - Started at 73.8%
   - Now at 92.3%
   - +18.5% improvement in 30 days
4. Show minimal critical issues (only 2)
5. Demonstrate mature client relationship
```

### Part 4: Adding New Firm (2 minutes)
```
1. Return to dashboard
2. Click "Add New Firm" button
3. Fill out demo form:
   - Name: "Williams & Co"
   - Email: demo@williams.com
   - Phone: (555) 999-8888
   - CasePeer URL: https://api.casepeer.com
   - API Key: demo-key-123
4. Click "Test Connection" (will fail in demo)
5. Check "Scan all cases immediately"
6. Click "Add & Scan Now"
7. Show how it would redirect to new firm page
```

### Part 5: Inactive Clients (1 minute)
```
1. Return to dashboard
2. Toggle "Show All" to reveal inactive firms
3. Click on "Martinez & Partners"
4. Show poor compliance (58.3%)
5. Explain this is a churned client
6. Historical data preserved
```

---

## 📊 Key Metrics to Highlight

### System-Wide
- **3 firms** total (2 active, 1 inactive)
- **45 cases** across all firms
- **778 documents** analyzed
- **6 scans** performed

### By Firm
| Firm | Status | Score | Critical | Cases |
|------|--------|-------|----------|-------|
| Smith & Associates | Active | 76.5% | 8 | 15 |
| Johnson Legal | Active | 92.3% | 2 | 22 |
| Martinez & Partners | Inactive | 58.3% | 15 | 8 |

---

## 🎓 Teaching Points

### For Law Firms:
1. **Early Detection** - Find issues before they become problems
2. **Progress Tracking** - See improvement over time (Johnson example)
3. **Compliance Scoring** - Objective measurement of file completeness
4. **Critical vs Required** - Prioritize what matters most

### For Internal Team:
1. **Multi-Firm Management** - Handle multiple clients efficiently
2. **Bulk Scanning** - Process hundreds of cases quickly
3. **Encrypted Credentials** - Secure API key storage
4. **Audit History** - Track every scan for compliance

### For Developers:
1. **Stateless Architecture** - No document storage, just scanning
2. **Real-time Processing** - Live scan progress
3. **Scalable Design** - Ready for thousands of cases
4. **WCAG AA Compliant** - Accessible to all users

---

## 🔧 Technical Setup

### Database Setup (if needed)
```bash
# Connect to your database
export DATABASE_URL="your_database_url_here"

# Run migrations
npx prisma migrate deploy

# Seed demo data
npm run seed
```

### Local Development
```bash
# Start dev server
npm run dev

# Login at http://localhost:3000
# Password: CaseGuard2025
```

### Production
```
URL: https://legal-file-auditor.vercel.app
Password: CaseGuard2025
```

---

## 💡 Demo Tips

1. **Start with Dashboard** - Give overview before diving into details
2. **Use Smith & Associates First** - Shows immediate value for new clients
3. **Show Johnson Legal Second** - Proves long-term value
4. **Highlight Real-Time Scanning** - Demonstrates system capability
5. **End with Add Firm** - Show how easy it is to onboard new clients

---

## 🎯 Common Questions & Answers

**Q: Does this store documents?**
A: No! CaseGuard only scans and audits. All documents stay in CasePeer.

**Q: How long does a scan take?**
A: Typically 30-45 minutes for 20-30 cases (shown in demo data).

**Q: Can firms see this dashboard?**
A: No, this is internal only. Firms get reports via email.

**Q: What happens to inactive firms?**
A: Data is preserved for compliance but hidden by default.

**Q: How are credentials stored?**
A: API keys are encrypted with AES-256-GCM before storage.

---

## 📈 Future Enhancements (Roadmap)

- [ ] Email notifications for critical issues
- [ ] Scheduled automatic scans
- [ ] White-label reports for clients
- [ ] Document upload assistance
- [ ] Integration with DocuSign
- [ ] Mobile app for attorneys

---

**Last Updated:** November 2025
**Version:** 1.0 Demo
**Contact:** Internal Tool - No external support

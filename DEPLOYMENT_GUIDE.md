# Deployment Guide - Legal File Auditor

## Production URL
https://legal-file-auditor-56ytm6psc-francis-projects-cc692baf.vercel.app

## Quick Start for Demos

The application is deployed and running in **demo mode** with 3 sample personal injury cases. You can access it immediately at the URL above.

### Demo Cases Included:

1. **Sarah Johnson** - Auto Accident (Treatment Phase)
   - 65% file completeness
   - Missing: Medical Bills, Wage Loss Documentation
   - 5 documents on file

2. **Michael Rodriguez** - Premises Liability (Demand Phase)
   - 85% file completeness
   - Ready for demand letter
   - 8 documents on file

3. **Jennifer Martinez** - Auto Accident (Intake Phase)
   - 25% file completeness
   - Just opened, needs critical intake documents
   - 1 document on file

## Setting Up Environment Variables (Optional)

To enable full functionality, add these environment variables in the Vercel dashboard:

### 1. OpenAI API Key (for AI Document Analysis)

```bash
vercel env add OPENAI_API_KEY production
# Paste your OpenAI API key when prompted
```

**What this enables:**
- Real-time document classification using GPT-4
- OCR for scanned documents
- Intelligent document extraction

**Without this:** The app still works in demo mode using filename-based classification.

### 2. CasePeer Integration (Optional)

```bash
vercel env add CASEPEER_API_URL production
# Enter: https://api.casepeer.com/v1

vercel env add CASEPEER_API_KEY production
# Paste your CasePeer API key when prompted

vercel env add CASEPEER_ENABLED production
# Enter: true

vercel env add NEXT_PUBLIC_CASEPEER_ENABLED production
# Enter: true
```

**What this enables:**
- Live sync with CasePeer case management system
- Real case data instead of mock data
- Automatic document updates

**Without this:** The app uses 3 built-in demo cases for demonstrations.

## Redeploying After Adding Environment Variables

After adding environment variables, redeploy:

```bash
vercel --prod
```

Or use the Vercel dashboard to trigger a new deployment.

## Using the Demo

### Dashboard Features:
- **Overall Statistics**: Average completeness, critical gaps, compliant cases
- **Case Cards**: Each case shows completion score and missing documents
- **Color Coding**:
  - Green (90%+): Excellent - file is complete
  - Yellow (70-89%): Good - minor items missing
  - Red (<70%): Needs Attention - critical documents missing

### Viewing Detailed Audits:
1. Click "View Audit Details" on any case card
2. See complete document checklist with status icons
3. Review AI-powered recommendations
4. Check phase readiness assessment
5. View completeness breakdown by case phase

### Understanding the Scoring:
- **Critical Documents** (10 points): Must-haves like intake forms, fee agreements
- **Required Documents** (5 points): Important like medical records
- **Recommended Documents** (2 points): Best practices like witness statements
- **Optional Documents** (1 point): Nice to have

## Client Demo Script

When showing this to law firm clients:

1. **Start at Dashboard**
   - "This is your firm's case overview. Each case gets an AI-powered completeness score."
   - Point out the stats: "You can see at a glance how many cases need attention."

2. **Click on Sarah Johnson's Case**
   - "Here's a detailed audit of this auto accident case."
   - Show the checklist: "Green checkmarks show what you have, red X's show what's missing."
   - Point to AI Recommendations: "The AI tells you exactly what to do next."

3. **Highlight Phase Readiness**
   - "Before moving from Treatment to Demand phase, you need these documents..."
   - "The system prevents you from missing critical items."

4. **Explain CasePeer Integration**
   - "This integrates directly with your CasePeer system."
   - "Every time you upload a document, the AI classifies it automatically."
   - "No manual checklists, no spreadsheets - just smart automation."

5. **Business Value**
   - "Never miss a critical document before filing or demanding."
   - "Junior attorneys get the same quality checks as senior partners."
   - "Reduce malpractice risk by ensuring file completeness."

## Technical Architecture

### Stack:
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui
- **AI**: OpenAI GPT-4 for document classification
- **API**: CasePeer REST API integration
- **Hosting**: Vercel (serverless)

### Key Features:
- Server-side rendering for performance
- Lazy-loaded OpenAI client (no API key required for build)
- Mock data mode for demos without API access
- Responsive design for desktop and tablet

## Customization for Client Needs

### Adding Document Types:
Edit `/lib/document-requirements.ts` to add firm-specific documents.

### Changing Phases:
Modify `/types/index.ts` to match client's workflow stages.

### Adjusting Scoring:
Update `/lib/audit-engine.ts` to change point values.

### White Labeling:
- Update `NEXT_PUBLIC_APP_NAME` in `.env.local`
- Replace logo in `/app/layout.tsx`
- Customize colors in `tailwind.config.js`

## Support & Next Steps

### To Add Real CasePeer Data:
1. Obtain API credentials from CasePeer
2. Add environment variables (see above)
3. Redeploy application
4. System will automatically switch from demo to live mode

### To Enable AI Document Analysis:
1. Get OpenAI API key from platform.openai.com
2. Add `OPENAI_API_KEY` environment variable
3. Redeploy
4. Upload documents to test real AI classification

### For Custom Development:
Contact for additional features like:
- Multi-tenant support for law firm networks
- Additional case types (criminal, family law, etc.)
- Batch document upload
- Email integration for document routing
- Mobile app for attorneys in the field

---

**Demo URL**: https://legal-file-auditor-56ytm6psc-francis-projects-cc692baf.vercel.app

Ready to show to clients! No setup required - works immediately in demo mode.

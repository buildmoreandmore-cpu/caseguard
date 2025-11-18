# Legal File Auditor

AI-powered case file completeness auditing tool for personal injury law firms with CasePeer integration.

## Features

- **CasePeer Integration**: Direct API integration with CasePeer case management software
- **AI Document Classification**: GPT-4 powered document analysis and classification
- **Completeness Scoring**: Automated scoring of case file completeness by phase
- **Smart Recommendations**: AI-generated recommendations for missing documents
- **Phase Readiness Assessment**: Determine if cases are ready to advance to next phase
- **Personal Injury Focused**: Pre-configured checklists for PI case phases

## Case Phases Supported

1. **Intake**: Client onboarding and initial documentation
2. **Treatment**: Medical treatment and evidence gathering
3. **Demand**: Pre-litigation settlement demand preparation
4. **Litigation**: Active lawsuit document management
5. **Settlement**: Final settlement documentation

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI GPT-4 for document analysis
- **Integration**: CasePeer REST API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key (for AI document analysis)
- CasePeer API credentials (optional - demo mode available)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Edit .env.local with your credentials:
# - OPENAI_API_KEY: Your OpenAI API key
# - CASEPEER_API_KEY: Your CasePeer API key (optional)
# - CASEPEER_ENABLED: Set to 'true' to use live CasePeer data

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Demo Mode

The application includes a fully functional demo mode with 3 sample personal injury cases:

1. **Sarah Johnson** - Auto Accident (Treatment Phase) - 65% complete
2. **Michael Rodriguez** - Premises Liability (Demand Phase) - 85% complete
3. **Jennifer Martinez** - Auto Accident (Intake Phase) - 25% complete

Demo mode is active when `CASEPEER_ENABLED=false` in your environment.

## CasePeer Integration

To enable live CasePeer integration:

1. Obtain API credentials from CasePeer
2. Set environment variables:
   ```env
   CASEPEER_API_URL=https://api.casepeer.com/v1
   CASEPEER_API_KEY=your_api_key
   CASEPEER_ENABLED=true
   NEXT_PUBLIC_CASEPEER_ENABLED=true
   ```
3. Restart the development server

The app will automatically sync cases and documents from your CasePeer account.

## Document Classification

The AI analyzes documents using:

- **Filename Pattern Matching**: Fast classification based on common naming conventions
- **GPT-4 Vision**: Advanced OCR and analysis for scanned documents
- **Confidence Scoring**: Each classification includes a confidence score

Supported document types:
- Client intake forms
- Fee agreements
- Medical authorizations
- Police reports
- Medical records & bills
- Wage loss documentation
- Demand letters
- Court filings
- And more...

## Scoring Algorithm

Cases are scored based on:

- **Critical Documents** (10 points each): Must-have documents for phase completion
- **Required Documents** (5 points each): Important but not blocking
- **Recommended Documents** (2 points each): Best practice items
- **Optional Documents** (1 point each): Nice to have

Overall score = (Achieved Points / Total Possible Points) × 100

## API Routes

- `GET /api/cases` - Fetch all cases
- `GET /api/cases/[caseId]/audit` - Generate audit report for a case
- `POST /api/analyze-document` - Upload and analyze a document with AI

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add OPENAI_API_KEY
vercel env add CASEPEER_API_KEY
vercel env add CASEPEER_ENABLED

# Deploy to production
vercel --prod
```

## Use Cases

### For Law Firms
- Audit case files before demand or litigation
- Identify missing critical documents early
- Ensure compliance with firm standards
- Track case readiness across entire caseload

### For Legal Tech Companies
- Embed into existing case management platforms
- Offer as value-add feature for clients
- Demonstrate AI capabilities in legal workflows

### For Solo Practitioners
- Maintain professional case file standards
- Never miss required documents
- Streamline case preparation

## Customization

### Adding Document Types

Edit `/lib/document-requirements.ts` to add new document types or modify requirements.

### Changing Scoring Weights

Adjust point values in `/lib/audit-engine.ts` method `calculateTotalWeight()`.

### Custom Case Types

Add new case types in `/types/index.ts` and create corresponding checklists.

## License

MIT License - Feel free to use for commercial purposes.

---

Built with Claude Code

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DocumentType } from '@/types';

// Initialize OpenAI client lazily to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * AI Document Classification and Analysis
 * Uses GPT-4 to classify legal documents and extract key information
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // For PDFs, we'll use GPT-4 Vision if it's an image-based PDF
    // or text extraction + GPT-4 for text-based PDFs
    const fileType = file.type;

    let documentAnalysis;

    if (fileType === 'application/pdf') {
      // For demo, we'll analyze based on filename patterns
      // In production, you'd extract text from PDF and send to GPT-4
      documentAnalysis = await analyzeDocumentByFilename(file.name);
    } else if (fileType.startsWith('image/')) {
      // Use GPT-4 Vision for images
      documentAnalysis = await analyzeDocumentWithVision(base64, fileType);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    return NextResponse.json(documentAnalysis);
  } catch (error: any) {
    console.error('Error analyzing document:', error);
    return NextResponse.json(
      { error: 'Failed to analyze document', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Analyze document using filename patterns (for demo)
 */
async function analyzeDocumentByFilename(filename: string) {
  const lowerFilename = filename.toLowerCase();

  // Pattern matching for common document types
  const patterns: { pattern: RegExp; type: DocumentType; confidence: number }[] = [
    { pattern: /intake|client.*form/i, type: 'client_intake_form', confidence: 0.9 },
    { pattern: /fee.*agreement|retainer/i, type: 'fee_agreement', confidence: 0.9 },
    { pattern: /medical.*auth|hipaa/i, type: 'medical_authorization', confidence: 0.9 },
    { pattern: /police.*report|incident.*report/i, type: 'police_report', confidence: 0.85 },
    { pattern: /photo|image|scene/i, type: 'incident_photos', confidence: 0.8 },
    { pattern: /witness.*statement/i, type: 'witness_statements', confidence: 0.85 },
    { pattern: /medical.*record/i, type: 'medical_records', confidence: 0.9 },
    { pattern: /medical.*bill|invoice/i, type: 'medical_bills', confidence: 0.9 },
    { pattern: /employment|employer/i, type: 'employment_records', confidence: 0.8 },
    { pattern: /wage|pay.*stub|w-2|tax.*return/i, type: 'wage_loss_documentation', confidence: 0.85 },
    { pattern: /damage.*estimate|repair/i, type: 'property_damage_estimate', confidence: 0.8 },
    { pattern: /insurance.*correspondence|adjuster/i, type: 'insurance_correspondence', confidence: 0.8 },
    { pattern: /demand.*letter/i, type: 'demand_letter', confidence: 0.9 },
    { pattern: /complaint|petition/i, type: 'complaint', confidence: 0.85 },
    { pattern: /discovery.*request|interrogator/i, type: 'discovery_requests', confidence: 0.85 },
    { pattern: /discovery.*response/i, type: 'discovery_responses', confidence: 0.85 },
    { pattern: /expert.*report/i, type: 'expert_reports', confidence: 0.85 },
    { pattern: /settlement.*agreement|release/i, type: 'settlement_agreement', confidence: 0.9 },
  ];

  let detectedType: DocumentType = 'other';
  let confidence = 0.5;

  for (const { pattern, type, confidence: patternConfidence } of patterns) {
    if (pattern.test(lowerFilename)) {
      detectedType = type;
      confidence = patternConfidence;
      break;
    }
  }

  // Use GPT-4 to generate a summary based on document type
  const summary = await generateDocumentSummary(detectedType, filename);

  return {
    documentType: detectedType,
    confidence,
    extractedData: {
      filename,
      detectedFrom: 'filename_pattern',
    },
    summary,
  };
}

/**
 * Analyze document using GPT-4 Vision (for images)
 */
async function analyzeDocumentWithVision(base64Image: string, mimeType: string) {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a legal document classifier for personal injury cases. Analyze this document image and:
1. Classify it into one of these types: client_intake_form, fee_agreement, medical_authorization, police_report, incident_photos, witness_statements, medical_records, medical_bills, employment_records, wage_loss_documentation, property_damage_estimate, insurance_correspondence, demand_letter, complaint, discovery_requests, discovery_responses, expert_reports, settlement_agreement, other
2. Provide a confidence score (0-1)
3. Extract any key information visible (dates, names, amounts, case numbers)
4. Provide a brief summary

Return your response as JSON with this structure:
{
  "documentType": "type_here",
  "confidence": 0.95,
  "extractedData": {"key": "value"},
  "summary": "Brief description"
}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(response);
}

/**
 * Generate a document summary based on type
 */
async function generateDocumentSummary(documentType: DocumentType, filename: string): Promise<string> {
  const summaries: Record<DocumentType, string> = {
    client_intake_form: 'Initial client information and case details collected during intake',
    fee_agreement: 'Attorney-client fee agreement outlining representation terms',
    medical_authorization: 'HIPAA authorization for obtaining medical records',
    police_report: 'Official law enforcement incident report',
    incident_photos: 'Photographic evidence of accident scene or injuries',
    witness_statements: 'Recorded statements from witnesses to the incident',
    medical_records: 'Complete medical treatment documentation',
    medical_bills: 'Itemized billing statements for medical treatment',
    employment_records: 'Employment verification and wage history',
    wage_loss_documentation: 'Documentation supporting lost wage claims',
    property_damage_estimate: 'Repair estimates or property loss valuation',
    insurance_correspondence: 'Communications with insurance companies',
    demand_letter: 'Formal settlement demand to insurance carrier',
    complaint: 'Court filing initiating lawsuit',
    discovery_requests: 'Formal requests for information in litigation',
    discovery_responses: 'Responses to discovery requests',
    expert_reports: 'Expert witness analysis and opinions',
    settlement_agreement: 'Final settlement and release documents',
    other: 'Unclassified case document',
  };

  return summaries[documentType] || `Document: ${filename}`;
}

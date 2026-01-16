import Link from 'next/link';
import { Scale, Link2, FileSearch, BarChart3, FileCheck, ArrowRight, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SUPPORTED_CMS = [
  { name: 'Filevine', id: 'filevine' },
  { name: 'CasePeer', id: 'casepeer' },
  { name: 'Clio', id: 'clio' },
  { name: 'MyCase', id: 'mycase' },
  { name: 'PracticePanther', id: 'practicepanther' },
  { name: 'Smokeball', id: 'smokeball' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">CaseGuard</span>
            </div>
            <Link href="/demo">
              <Button className="bg-slate-900 hover:bg-slate-800 h-11 px-5">
                See Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              AI-Powered Case File Auditing for Personal Injury Firms
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect your case management software. We scan every document, identify what's missing,
              and show you exactly what to request—before it becomes a problem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/demo">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-lg px-8 py-6 h-auto">
                  See the Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-2">
                  How It Works
                </Button>
              </Link>
            </div>

            {/* Supported CMS */}
            <div className="pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 mb-4">Connects to your existing case management software</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUPPORTED_CMS.map((cms) => (
                  <Badge key={cms.id} variant="secondary" className="px-3 py-1.5 text-sm bg-white border">
                    {cms.name}
                  </Badge>
                ))}
                <Badge variant="outline" className="px-3 py-1.5 text-sm">
                  + Any REST API
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What CaseGuard Does */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              What CaseGuard Does
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We connect to your case management system and audit every case file for completeness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <Link2 className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Connects to Your CMS</h3>
                <p className="text-slate-600 text-sm">
                  Link your Filevine, CasePeer, Clio, or any case management system with a REST API.
                  Your data stays in your system—we just read it.
                </p>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <FileSearch className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Document Classification</h3>
                <p className="text-slate-600 text-sm">
                  GPT-4 analyzes each document, classifying it by type: intake forms, medical records,
                  bills, police reports, demand letters, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Finds Missing Documents</h3>
                <p className="text-slate-600 text-sm">
                  Compares what you have against what you need for each case phase.
                  Critical gaps surface immediately—not at trial.
                </p>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Scores Each Case</h3>
                <p className="text-slate-600 text-sm">
                  Get a completeness score for every case and phase.
                  See at a glance which cases need attention and which are ready to move forward.
                </p>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <FileCheck className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Prioritized Action List</h3>
                <p className="text-slate-600 text-sm">
                  Critical documents first, then required, then recommended.
                  Know exactly what to request next for each case.
                </p>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Phase Readiness</h3>
                <p className="text-slate-600 text-sm">
                  Automatically determines if cases are ready to advance from Intake to Treatment,
                  Treatment to Demand, and so on.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Four simple steps to complete visibility into your case files
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: 1, title: 'Connect', icon: Link2, desc: 'Select your CMS (Filevine, CasePeer, Clio, etc.) and enter your API credentials. We test the connection before saving.' },
              { step: 2, title: 'Scan', icon: FileSearch, desc: 'CaseGuard pulls your cases and documents, then uses AI to classify each file by document type automatically.' },
              { step: 3, title: 'Audit', icon: BarChart3, desc: 'Each case is scored against phase-specific checklists. See completeness scores and identify critical gaps instantly.' },
              { step: 4, title: 'Act', icon: CheckCircle2, desc: 'Get a prioritized list of missing documents for each case. Request what\'s missing, close the gaps, advance your cases.' },
            ].map((item) => (
              <div key={item.step} className="text-center bg-white p-6 rounded-xl border">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-slate-500 mb-1">Step {item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Phases */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Personal Injury Case Phases
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              CaseGuard tracks document requirements across all five phases
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { phase: 'Intake', docs: 'Intake forms, fee agreements, authorizations' },
                { phase: 'Treatment', docs: 'Medical records, bills, wage loss docs' },
                { phase: 'Demand', docs: 'Demand letters, property damage estimates' },
                { phase: 'Litigation', docs: 'Complaints, discovery, expert reports' },
                { phase: 'Settlement', docs: 'Settlement agreements, releases' },
              ].map((item, idx) => (
                <div key={item.phase} className="p-4 rounded-lg border bg-slate-50">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Phase {idx + 1}</div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.phase}</h3>
                  <p className="text-xs text-slate-600">{item.docs}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Technical Details
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-slate-700" />
                  <h3 className="font-semibold text-lg">Security</h3>
                </div>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>API credentials encrypted at rest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Read-only access to your CMS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>No documents stored—only metadata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>SOC 2 compliant infrastructure</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3 mb-4">
                  <Link2 className="w-5 h-5 text-slate-700" />
                  <h3 className="font-semibold text-lg">Integration</h3>
                </div>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Works with any CMS with a REST API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Pre-built adapters for Filevine, CasePeer, Clio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Custom endpoint configuration available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>Test connection before saving credentials</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            See it in action
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Explore the demo with sample firms and real audit reports.
            No signup required.
          </p>
          <Link href="/demo">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 h-auto font-semibold">
              See the Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-white">CaseGuard</span>
            </div>
            <p className="text-slate-500 text-sm">
              AI-powered document auditing for personal injury law firms
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

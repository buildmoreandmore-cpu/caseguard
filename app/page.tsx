import Link from 'next/link';
import { Scale, Link2, FileSearch, BarChart3, FileCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">CaseGuard</span>
            </div>
            <Link href="/demo">
              <Button className="bg-blue-600 hover:bg-blue-700">
                See Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Automated Legal File Auditing for Personal Injury Firms
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Ensure case file completeness across all litigation phases.
              Connect to CasePeer and get instant visibility into missing documents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto">
                  See the Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Four simple steps to ensure your case files are complete and ready for every phase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Link2 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-blue-600 mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Connect</h3>
              <p className="text-slate-600">
                Connect your legal case management software securely
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileSearch className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-sm font-semibold text-emerald-600 mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Scan</h3>
              <p className="text-slate-600">
                Automated analysis of all case documents and file names
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-amber-600" />
              </div>
              <div className="text-sm font-semibold text-amber-600 mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Score</h3>
              <p className="text-slate-600">
                Get completeness scores for each case by litigation phase
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileCheck className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-purple-600 mb-2">Step 4</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fix</h3>
              <p className="text-slate-600">
                Prioritized list of missing documents to complete your files
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Built for Personal Injury Firms
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to maintain complete case files throughout the litigation lifecycle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <CheckCircle2 className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Document Classification</h3>
                <p className="text-slate-600">
                  Automatically categorizes intake forms, medical records, bills, and court filings
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <CheckCircle2 className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">5-Phase Tracking</h3>
                <p className="text-slate-600">
                  Monitor readiness across Intake, Treatment, Demand, Litigation, and Settlement
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <CheckCircle2 className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Weighted Scoring</h3>
                <p className="text-slate-600">
                  Critical, required, and recommended documents weighted by importance
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <CheckCircle2 className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">CasePeer Integration</h3>
                <p className="text-slate-600">
                  Direct sync with your existing case management system
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <CheckCircle2 className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Firm Support</h3>
                <p className="text-slate-600">
                  Manage multiple law firms from a single dashboard
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <CheckCircle2 className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Actionable Insights</h3>
                <p className="text-slate-600">
                  Smart recommendations on what to request or complete next
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to See It in Action?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Explore the demo with sample law firms and see how CaseGuard can help ensure your case files are always complete.
          </p>
          <Link href="/demo">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
              See the Demo Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">CaseGuard</span>
            </div>
            <p className="text-slate-400 text-sm">
              Automated Legal File Auditor for Personal Injury Firms
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { Scale, Link2, FileSearch, BarChart3, FileCheck, ArrowRight, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
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
              <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-5">
                See Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Lead with empathy */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-blue-600 font-semibold text-lg mb-4">
              For Personal Injury Law Firms
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Stop losing cases to missing documents
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              You know the frustration. A case stalls because someone forgot to request medical records.
              Or worse, you find out at trial. CaseGuard catches what gets missed.
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
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Critical gaps found too late</h3>
                <p className="text-slate-600">
                  Missing documents surface at the worst possible time
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Hours spent checking files</h3>
                <p className="text-slate-600">
                  Manual audits drain time from actual case work
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">CaseGuard catches it all</h3>
                <p className="text-slate-600">
                  Automated scans show exactly what's missing
                </p>
              </div>
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
              Four steps. Complete visibility. No more surprises.
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
                Link your case management software securely
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
                Every document analyzed and categorized automatically
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
                See completeness scores for each case phase
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
                Get a prioritized list of what to request next
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to stay ahead
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built specifically for personal injury litigation workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow bg-white">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Document Classification</h3>
                <p className="text-slate-600">
                  Intake forms, medical records, bills, court filings — automatically sorted
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow bg-white">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">5-Phase Tracking</h3>
                <p className="text-slate-600">
                  Intake, Treatment, Demand, Litigation, Settlement — tracked separately
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow bg-white">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Priority Scoring</h3>
                <p className="text-slate-600">
                  Critical documents flagged first, so you know what matters most
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow bg-white">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Works With Your Software</h3>
                <p className="text-slate-600">
                  Connects to your existing case management system
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow bg-white">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Firm Dashboard</h3>
                <p className="text-slate-600">
                  Manage multiple firms from one place
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow bg-white">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Clear Recommendations</h3>
                <p className="text-slate-600">
                  Know exactly what to request and when
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
            See it in action
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Explore the demo with sample firms and real audit reports.
            No signup required.
          </p>
          <Link href="/demo">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
              See the Demo
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
              Document auditing for personal injury firms
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom'
import { Truck, RotateCcw, ShieldCheck, Box, Clock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

export default function ShippingReturnsPage() {
  const steps = [
    {
      num: '01',
      title: 'Initiate Your Return',
      desc: 'Contact support with your order reference (ORD-2026-XXXX) within 30 days of delivery.',
    },
    {
      num: '02',
      title: 'Print Prepaid Label',
      desc: 'We immediately generate a prepaid insured return shipping label with zero cost to you.',
    },
    {
      num: '03',
      title: 'Drop Off Package',
      desc: 'Pack the device in its original packaging and drop it off at any authorized courier depot.',
    },
    {
      num: '04',
      title: 'Rapid Refund Issued',
      desc: 'Upon quick technical inspection at our lab, your full refund is credited back to your original payment method within 48 hours.',
    },
  ]

  const shippingTable = [
    { region: 'United States (Domestic)', method: 'Express Air (FedEx / UPS)', time: '2 Business Days', cost: 'Free on orders over $50 ($15 otherwise)' },
    { region: 'Canada & Mexico', method: 'Cross-Border Priority', time: '3 - 5 Business Days', cost: '$20 Flat Rate' },
    { region: 'Europe & United Kingdom', method: 'DHL Express Worldwide', time: '3 - 5 Business Days', cost: '$25 Flat Rate' },
    { region: 'Asia Pacific & Rest of World', method: 'International Air Courier', time: '5 - 7 Business Days', cost: '$30 Flat Rate' },
  ]

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-50/70 border-b border-slate-100 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            Fast Delivery & Return Policy
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Transparent shipping.<br />
            <span className="text-slate-700">Effortless returns.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Every order is dispatched in eco-conscious fiber packaging with end-to-end real-time tracking, backed by our 30-day no-questions-asked guarantee.
          </p>
        </div>
      </section>

      {/* Shipping Details Table */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Timelines & Rates</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Worldwide Shipping Speeds
            </h2>
          </div>
          <span className="text-xs text-slate-500">Orders placed before 2 PM PST ship same day</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 sm:p-5">Region</th>
                  <th className="p-4 sm:p-5">Carrier Service</th>
                  <th className="p-4 sm:p-5">Transit Time</th>
                  <th className="p-4 sm:p-5">Shipping Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {shippingTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-slate-900">{row.region}</td>
                    <td className="p-4 sm:p-5">{row.method}</td>
                    <td className="p-4 sm:p-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold text-[11px]">
                        <Clock className="w-3 h-3" />
                        {row.time}
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 font-medium text-slate-800">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 30-Day Money-Back Guarantee Process */}
      <section className="bg-slate-50/60 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Peace of Mind</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              30-Day Money-Back Guarantee
            </h2>
            <p className="text-xs text-slate-500">
              Try your device in your everyday workflow. If you aren't completely satisfied, returning it is simple.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3 relative"
              >
                <span className="text-2xl font-extrabold text-slate-300 block">{step.num}</span>
                <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2-Year Official Warranty Callout */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
              <ShieldCheck className="w-5 h-5" />
              Comprehensive Hardware Protection
            </div>
            <h3 className="text-xl font-bold text-slate-900">2-Year Official Warranty Included</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All Ecart devices are backed by a comprehensive two-year manufacturer warranty covering battery health, display panels, acoustic transducers, and internal circuitry.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            File Warranty Claim
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, RefreshCw, Sun, Box, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function SustainabilityPage() {
  const [selectedDevice, setSelectedDevice] = useState('Nexus Pro Phone')
  const [tradeValue, setTradeValue] = useState(450)

  const tradeValues = {
    'Nexus Pro Phone': 450,
    'Nexus Neo 5G': 280,
    'Zenbook Elite': 550,
    'Silentis ANC': 120,
    'Vitals Watch': 90,
  }

  const handleDeviceChange = (dev) => {
    setSelectedDevice(dev)
    setTradeValue(tradeValues[dev] || 150)
  }

  const pillars = [
    {
      icon: Box,
      title: '100% Fiber-Based Packaging',
      desc: 'We have eliminated virgin single-use plastics from our entire packaging supply chain, utilizing 94% recycled molded bamboo and paper pulp.',
    },
    {
      icon: Sun,
      title: 'Net-Zero Cloud & Operations',
      desc: 'Our decoupled API infrastructure and design labs run on 100% renewable wind and solar energy, with verified carbon offsetting for every shipment.',
    },
    {
      icon: RefreshCw,
      title: 'Right to Repair & Longevity',
      desc: 'We engineer modular components and provide open repair guides, accompanied by guaranteed 5-year OS security updates for all active devices.',
    },
    {
      icon: ShieldCheck,
      title: 'Ethical Mineral Sourcing',
      desc: 'All cobalt, tungsten, and rare-earth magnets utilized in our acoustic drivers and batteries are third-party certified fair-trade and conflict-free.',
    },
  ]

  const stats = [
    { metric: '94%', label: 'Recycled fiber packaging' },
    { metric: '100%', label: 'Renewable energy in servers' },
    { metric: '45,000+', label: 'Devices saved from landfills' },
    { metric: '5 Years', label: 'Guaranteed software support' },
  ]

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-50/70 border-b border-slate-100 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-emerald-700 shadow-sm">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            Environmental Responsibility
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Technology in harmony<br />
            <span className="text-slate-700">with the planet.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            True engineering excellence means taking responsibility for every stage of a device’s lifecycle—from ethical raw material extraction to zero-waste packaging and seamless trade-in recycling.
          </p>
        </div>
      </section>

      {/* Impact Stats Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm text-center space-y-1"
            >
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight block">
                {item.metric}
              </span>
              <span className="text-xs text-slate-500 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sustainability Pillars */}
      <section className="bg-slate-50/60 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Our Commitments</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              A closed-loop circular lifecycle
            </h2>
            <p className="text-xs text-slate-500">
              How we minimize environmental footprint without sacrificing hardware performance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trade-In Estimator Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Ecart Trade-In Initiative
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Give your device a second life. Earn store credit.
              </h3>
            </div>
            <span className="text-xs text-slate-400">Instant Estimate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">Select Current Device</label>
              <select
                value={selectedDevice}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
              >
                {Object.keys(tradeValues).map((dev) => (
                  <option key={dev} value={dev}>{dev}</option>
                ))}
              </select>

              <div className="space-y-2 text-xs text-slate-500 pt-2">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Free prepaid shipping kit provided
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Direct trade-in credit toward next purchase
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Certified DoD standard data wiping
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 space-y-3">
              <span className="text-xs text-slate-500 font-medium">Estimated Trade-In Value</span>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                ${tradeValue}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                Instant credit at checkout
              </span>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors mt-2"
              >
                Apply to Next Order
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

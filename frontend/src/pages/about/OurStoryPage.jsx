import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Compass, ShieldCheck, Cpu, Leaf, HeartHandshake } from 'lucide-react'

export default function OurStoryPage() {
  const values = [
    {
      icon: Compass,
      title: 'Obsessive Simplicity',
      desc: 'We strip away superfluous gimmicks. Every curve, chassis bevel, and software interaction exists to serve a distinct purpose.',
    },
    {
      icon: Cpu,
      title: 'Precision Engineering',
      desc: 'Crafted with aerospace-grade alloys, custom acoustic drivers, and cutting-edge silicon to endure years of intensive daily use.',
    },
    {
      icon: ShieldCheck,
      title: 'Radical Integrity',
      desc: 'No hidden markups, no price-tampering tricks. Transparent specifications, fair repairability, and server-side pricing authority.',
    },
    {
      icon: Leaf,
      title: 'Mindful Footprint',
      desc: '100% plastic-free packaging and recycled anodized aluminum because true modern luxury respects the planet.',
    },
  ]

  const milestones = [
    { year: '2022', title: 'The Blueprint', desc: 'Founded by a tight team of industrial designers and systems engineers dissatisfied with planned obsolescence in consumer tech.' },
    { year: '2023', title: 'Nexus Pro & Silentis ANC', desc: 'Launched our flagship smartphone and studio headphones, winning international praise for uncompromised acoustic fidelity.' },
    { year: '2024', title: 'Global Decoupled Ecosystem', desc: 'Expanded into ultra-thin laptops and health wearables, accompanied by our high-performance decoupled e-commerce platform.' },
    { year: '2026', title: 'Zero-Compromise Future', desc: 'Achieving 100% circular packaging and expanding our right-to-repair modular component catalog worldwide.' },
  ]

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-50/70 border-b border-slate-100 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Our Heritage & Vision
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Designed for purpose.<br />
            <span className="text-slate-700">Engineered for life.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Ecart was born from a straightforward belief: technology should empower your daily life without demanding all your attention. We build high-performance electronics defined by clean aesthetics and uncompromising engineering.
          </p>
        </div>
      </section>

      {/* Origin Story Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">The Origin</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Rejecting clutter, embracing timeless utility.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              In an industry dominated by disposable gadgets and yearly incremental refreshes, we chose a different path. We set out to create devices that feel exceptional in the hand, perform flawlessly under heavy workloads, and age with grace.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              From our studio-grade acoustics to our precision laptops, every millimeter is debated, refined, and tested against rigorous real-world conditions.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                Explore The Collection
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200/60 shadow-sm relative">
              <img
                src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80"
                alt="Industrial Design Studio"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-slate-50/60 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Principles</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What guides our design philosophy
            </h2>
            <p className="text-xs text-slate-500">
              The four unshakeable pillars built into every product we ship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{val.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{val.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Milestones</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Journey So Far
          </h2>
        </div>

        <div className="space-y-6">
          {milestones.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg shrink-0">
                {item.year}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

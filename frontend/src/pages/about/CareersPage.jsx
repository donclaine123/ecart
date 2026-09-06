import { Sparkles, Laptop, ShieldCheck, Heart, Coffee, Mail } from 'lucide-react'

export default function CareersPage() {
  const perks = [
    {
      icon: Laptop,
      title: 'Top-Tier Hardware Lab',
      desc: 'Choose your ideal setup: high-end studio workstations, mechanical gear, and full access to our device testing bench.',
    },
    {
      icon: Coffee,
      title: 'Flexible Remote-First',
      desc: 'Work from wherever you are most inspired and focused. We value thoughtful engineering and craftsmanship over seat time.',
    },
    {
      icon: Heart,
      title: 'Comprehensive Wellness',
      desc: '100% premium health, dental, and vision coverage for you and your dependents, plus generous health and fitness stipends.',
    },
    {
      icon: ShieldCheck,
      title: 'Meaningful Ownership',
      desc: 'Every team member is an owner. We offer transparent equity grants that align directly with our long-term vision.',
    },
  ]

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="bg-slate-50/70 border-b border-slate-100 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Culture & Team
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Build the next generation<br />
            <span className="text-slate-700">of consumer technology.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We are designers, software engineers, and hardware architects dedicated to building electronics and digital experiences that elevate daily life.
          </p>
        </div>
      </section>

      {/* Perks / Culture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Why Ecart</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            An environment built for focus & craftsmanship
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk, i) => {
            const Icon = perk.icon
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{perk.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{perk.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Spontaneous Applications Card */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-100 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 mx-auto shadow-sm">
            <Mail className="w-5 h-5" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Interested in joining our mission?
          </h3>

          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            While we don’t have active public job openings right now, we are always eager to connect with exceptional engineers, industrial designers, and systems builders.
          </p>

          <div className="pt-2">
            <a
              href="mailto:careers@ecart.test"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

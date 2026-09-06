import { useState } from 'react'
import { Mail, MessageSquare, Phone, MapPin, Clock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

export default function ContactUsPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Order Inquiry',
    message: '',
  })

  const channels = [
    {
      icon: MessageSquare,
      title: '24/7 Tech Support',
      desc: 'Instant troubleshooting, firmware diagnostics, and account assistance.',
      contact: 'support@ecart.test',
      meta: 'Average response: <15 mins',
    },
    {
      icon: Phone,
      title: 'Warranty & Repairs',
      desc: 'Claims, hardware replacement parts, and repair status inquiries.',
      contact: 'warranty@ecart.test',
      meta: 'Mon-Fri, 9am - 6pm PST',
    },
    {
      icon: MapPin,
      title: 'Studio Headquarters',
      desc: 'Product design lab, industrial engineering, and corporate offices.',
      contact: 'San Francisco, CA 94107',
      meta: '500 Howard Street, Suite 400',
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', topic: 'Order Inquiry', message: '' })
    }, 3500)
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="bg-slate-50/70 border-b border-slate-100 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Support & Concierge
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            How can we help you?<br />
            <span className="text-slate-700">We are always here.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have a question about an order, hardware specifications, or warranty coverage? Reach out to our customer engineering team and receive dedicated human support.
          </p>
        </div>
      </section>

      {/* Support Channels Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {channels.map((ch, idx) => {
            const Icon = ch.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{ch.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{ch.desc}</p>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-800">{ch.contact}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ch.meta}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Message Concierge</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Send us an inquiry</h2>
            <p className="text-xs text-slate-500 mt-1">
              Fill in your details below and a specialist will follow up shortly.
            </p>
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Message Dispatched!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for reaching out. We have received your inquiry and a support engineer will respond to your email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alex Mercer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Topic</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
                >
                  <option value="Order Inquiry">Order Inquiry & Tracking</option>
                  <option value="Hardware Specs">Product Specifications & Compatibility</option>
                  <option value="Warranty Claim">Warranty Claim & Service</option>
                  <option value="Returns">Returns & Refunds</option>
                  <option value="General">Other / General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Your Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Dispatch Message
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

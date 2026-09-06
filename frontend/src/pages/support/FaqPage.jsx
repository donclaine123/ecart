import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, ChevronDown, ChevronUp, ArrowRight, MessageSquare } from 'lucide-react'

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [openIndex, setOpenIndex] = useState(0)

  const categories = ['All', 'Orders & Checkout', 'Shipping & Delivery', 'Warranty & Returns', 'Technical Architecture']

  const faqs = [
    {
      category: 'Orders & Checkout',
      question: 'How does atomic stock reservation prevent overselling?',
      answer: 'When you initiate checkout on Ecart, our backend executes an atomic database transaction with pessimistic row-level locking (DB::transaction + lockForUpdate()). The server verifies that current warehouse inventory meets your requested quantity before decrementing stock, guaranteeing that two shoppers cannot purchase the final remaining inventory item simultaneously.',
    },
    {
      category: 'Orders & Checkout',
      question: 'Why are prices verified server-side?',
      answer: 'We enforce strict server-side price authority. Clients submit only product identifiers and counts. All line item pricing, order subtotals, tax brackets, and shipping waivers are calculated directly from secure database records, preventing any client-side tampering.',
    },
    {
      category: 'Shipping & Delivery',
      question: 'How fast will my order arrive?',
      answer: 'Domestic orders qualify for Free 2-Day Express Air shipping on purchases over $50. Orders placed before 2 PM PST are dispatched the same day via FedEx or UPS, with tracking links emailed immediately.',
    },
    {
      category: 'Shipping & Delivery',
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship globally to over 45 countries using DHL Express Worldwide. International delivery typically takes 3 to 5 business days, and customs duties are calculated clearly before dispatch.',
    },
    {
      category: 'Warranty & Returns',
      question: 'What is your 30-day money-back guarantee policy?',
      answer: 'If you are not completely satisfied with your device, you may return it within 30 days of delivery for a full refund. We provide a prepaid insured return shipping label, and there are never any restocking fees.',
    },
    {
      category: 'Warranty & Returns',
      question: 'What does the 2-year official warranty cover?',
      answer: 'Our 2-year warranty covers all hardware manufacturing defects, internal circuitry, battery capacity degradation beyond normal use, OLED displays, and acoustic transducers. If a hardware fault occurs, we repair or replace the device at no charge.',
    },
    {
      category: 'Technical Architecture',
      question: 'How does Bearer token authentication work across decoupled domains?',
      answer: 'Ecart utilizes stateless Personal Access Tokens via Laravel Sanctum passed in the HTTP Authorization: Bearer header. This eliminates cross-origin cookie restrictions and third-party browser blocking across decoupled cloud hosts (such as a Vercel frontend communicating with a cloud REST API).',
    },
    {
      category: 'Technical Architecture',
      question: 'What happens to historical order invoices when product prices change?',
      answer: 'Our architecture enforces immutable order snapshots. When checkout completes, the exact product names and unit prices are snapshotted permanently into the order_items database table. Any future catalog edits or price updates will never alter historical invoices.',
    },
  ]

  const filteredFaqs = activeCategory === 'All'
    ? faqs
    : faqs.filter((item) => item.category === activeCategory)

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-50/70 border-b border-slate-100 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            Knowledge Base
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Frequently asked<br />
            <span className="text-slate-700">questions & answers.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Find immediate answers regarding orders, delivery timelines, warranty coverage, and our decoupled engineering architecture.
          </p>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat)
                setOpenIndex(null)
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordions List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 text-slate-500 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100/80 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Still Have Questions Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-100 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>

          <h3 className="text-xl font-bold text-slate-900">Still have questions?</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Our customer engineering team is online 24/7 to help you with technical and order inquiries.
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Contact Support
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

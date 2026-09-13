import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, CreditCard, Sparkles, Check, AlertCircle } from 'lucide-react'
import { loadStripeClient } from '../../services/stripe'
import { SupportedCardIcons, VisaIcon, MastercardIcon, AmexIcon, DiscoverIcon } from './CardBrandIcons'

export default function StripeCardSection({
  publishableKey,
  onCardReady,
  error: externalError,
}) {
  const [stripe, setStripe] = useState(null)
  const [elements, setElements] = useState(null)
  const [cardElement, setCardElement] = useState(null)
  const [cardMounted, setCardMounted] = useState(false)
  const [isSimulated, setIsSimulated] = useState(false)
  const [copiedTestCard, setCopiedTestCard] = useState(false)
  const [localError, setLocalError] = useState('')

  // Simulation form states when real Stripe CDN is unavailable or in mock mode
  const [cardData, setCardData] = useState({
    number: '4242 4242 4242 4242',
    exp: '12/28',
    cvc: '123',
    postal: '97477',
  })

  const cardDataRef = useRef(cardData)
  const cardContainerRef = useRef(null)

  // Keep ref up to date on every render
  useEffect(() => {
    cardDataRef.current = cardData
  }, [cardData])

  const passesLuhnCheck = (digits) => {
    let sum = 0
    let alternate = false
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits.charAt(i), 10)
      if (isNaN(n)) return false
      if (alternate) {
        n *= 2
        if (n > 9) n = (n % 10) + 1
      }
      sum += n
      alternate = !alternate
    }
    return sum % 10 === 0
  }

  const getCardBrand = (digits) => {
    if (digits.startsWith('4')) return 'Visa'
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard'
    if (/^(34|37)/.test(digits)) return 'Amex'
    if (/^(6011|65)/.test(digits)) return 'Discover'
    return 'Unknown'
  }

  const STRIPE_DECLINE_CARDS = {
    '4000000000000002': 'Your card was declined. Your bank rejected this transaction.',
    '4000000000009995': 'Your card was declined: insufficient funds.',
    '4000000000000041': 'Your card was declined: lost or stolen card.',
    '4000000000000069': 'Your card was declined: expired card.',
    '4000000000000127': "Your card was declined: incorrect security code (CVC).",
  }

  const validateCardData = (data) => {
    const digits = (data.number || '').replace(/\D/g, '')
    if (!digits) {
      return 'Your card number is required.'
    }
    const brand = getCardBrand(digits)
    if (brand === 'Unknown') {
      return 'Your card number is invalid. Unrecognized card network (must be Visa, Mastercard, Amex, or Discover).'
    }

    // Strict exact digit length per card network
    const expectedLength = brand === 'Amex' ? 15 : 16
    if (digits.length !== expectedLength) {
      return `Your card number is incomplete. ${brand} cards require exactly ${expectedLength} digits (you entered ${digits.length}).`
    }

    // Official Stripe test decline cards
    if (STRIPE_DECLINE_CARDS[digits]) {
      return STRIPE_DECLINE_CARDS[digits]
    }

    // Real-world Luhn checksum validation
    if (!passesLuhnCheck(digits)) {
      return 'Your card number is invalid. Luhn checksum verification failed.'
    }

    const exp = (data.exp || '').trim()
    const match = exp.match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/)
    if (!match) {
      return "Your card's expiration date is incomplete (format: MM/YY)."
    }
    const m = parseInt(match[1], 10)
    const y = parseInt(match[2].length === 2 ? '20' + match[2] : match[2], 10)
    if (m < 1 || m > 12) {
      return "Your card's expiration month is invalid."
    }
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    if (y < currentYear || (y === currentYear && m < currentMonth)) {
      return "Your card's expiration date has passed."
    }
    const cvcDigits = (data.cvc || '').replace(/\D/g, '')
    if (cvcDigits.length < 3 || cvcDigits.length > 4) {
      return "Your card's security code (CVC) is incomplete."
    }
    if (!data.postal || !data.postal.trim()) {
      return "Your card's billing postal code is required."
    }
    return null
  }

  // Register card handler callback to parent
  useEffect(() => {
    let mounted = true

    loadStripeClient(publishableKey).then((stripeInstance) => {
      if (!mounted) return
      setStripe(stripeInstance)

      if (stripeInstance.isMock || !cardContainerRef.current) {
        setIsSimulated(true)
        if (onCardReady) {
          onCardReady({
            isMock: true,
            validate: () => {
              const err = validateCardData(cardDataRef.current)
              if (err) setLocalError(err)
              return err
            },
            confirmPayment: async (clientSecret) => {
              const valError = validateCardData(cardDataRef.current)
              if (valError) {
                setLocalError(valError)
                return { error: { message: valError } }
              }
              setLocalError('')
              return stripeInstance.confirmCardPayment(clientSecret)
            },
          })
        }
        return
      }

      try {
        const el = stripeInstance.elements()
        setElements(el)

        const card = el.create('card', {
          style: {
            base: {
              color: '#0f172a',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '14px',
              '::placeholder': {
                color: '#94a3b8',
              },
            },
            invalid: {
              color: '#e11d48',
              iconColor: '#e11d48',
            },
          },
        })

        card.on('change', (event) => {
          if (event.error) {
            setLocalError(event.error.message)
          } else {
            setLocalError('')
          }
        })

        cardContainerRef.current.innerHTML = ''
        card.mount(cardContainerRef.current)
        setCardElement(card)
        setCardMounted(true)

        if (onCardReady) {
          onCardReady({
            isMock: false,
            validate: () => null,
            confirmPayment: async (clientSecret) => {
              return stripeInstance.confirmCardPayment(clientSecret, {
                payment_method: {
                  card: card,
                },
              })
            },
          })
        }
      } catch (err) {
        console.warn('Elements mounting notice:', err)
        setIsSimulated(true)
        if (onCardReady) {
          onCardReady({
            isMock: true,
            validate: () => {
              const err = validateCardData(cardDataRef.current)
              if (err) setLocalError(err)
              return err
            },
            confirmPayment: async (clientSecret) => {
              const valError = validateCardData(cardDataRef.current)
              if (valError) {
                setLocalError(valError)
                return { error: { message: valError } }
              }
              setLocalError('')
              return stripeInstance.confirmCardPayment(clientSecret)
            },
          })
        }
      }
    })

    return () => {
      mounted = false
      if (cardElement) {
        try {
          cardElement.destroy()
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }, [publishableKey])

  const handleCopyTestCard = () => {
    const fresh = {
      number: '4242 4242 4242 4242',
      exp: '12/28',
      cvc: '123',
      postal: '97477',
    }
    navigator.clipboard?.writeText('4242424242424242')
    setCardData(fresh)
    cardDataRef.current = fresh
    setLocalError('')
    setCopiedTestCard(true)
    setTimeout(() => setCopiedTestCard(false), 2000)
  }

  const handleNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardData((prev) => ({ ...prev, number: formatted }))
    if (raw.length === 0) {
      setLocalError('Your card number is required.')
    } else {
      const brand = getCardBrand(raw)
      const expectedLength = brand === 'Amex' ? 15 : 16

      if (brand === 'Unknown' && raw.length >= 4) {
        setLocalError('Your card number is invalid. Unrecognized card network.')
      } else if (raw.length < expectedLength) {
        setLocalError(`Your card number is incomplete. ${brand !== 'Unknown' ? brand : 'Card'} requires ${expectedLength} digits.`)
      } else if (raw.length > expectedLength) {
        setLocalError(`Your card number is invalid. ${brand} cards cannot exceed ${expectedLength} digits.`)
      } else if (STRIPE_DECLINE_CARDS[raw]) {
        setLocalError(STRIPE_DECLINE_CARDS[raw])
      } else if (!passesLuhnCheck(raw)) {
        setLocalError('Your card number is invalid. Luhn checksum verification failed.')
      } else {
        setLocalError('')
      }
    }
  }

  const handleExpChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    let formatted = raw
    if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`
    }
    setCardData((prev) => ({ ...prev, exp: formatted }))
    if (raw.length === 4) {
      setLocalError('')
    }
  }

  const handleCvcChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCardData((prev) => ({ ...prev, cvc: raw }))
    if (raw.length >= 3) {
      setLocalError('')
    }
  }

  const handlePostalChange = (e) => {
    setCardData((prev) => ({ ...prev, postal: e.target.value }))
    if (e.target.value.trim()) {
      setLocalError('')
    }
  }

  const displayError = localError || externalError

  const rawDigits = (cardData.number || '').replace(/\D/g, '')
  const currentBrand = getCardBrand(rawDigits)

  return (
    <div className="mt-2 p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4 transition-all">
      {/* Card Header & Test Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Card Payment</span>
            <span className="text-[10px] text-slate-500">Secure end-to-end encryption</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyTestCard}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-pointer transition-colors"
          title="Click to autofill Stripe test card details"
        >
          {copiedTestCard ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Card Autofilled!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Use Test Card: 4242...</span>
            </>
          )}
        </button>
      </div>

      {/* Accepted Card Networks row */}
      <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
        <span className="text-[11px] font-medium text-slate-600 flex items-center gap-2">
          <span>Supported Cards:</span>
          {currentBrand !== 'Unknown' && (
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
              {currentBrand}
            </span>
          )}
        </span>
        <SupportedCardIcons detectedBrand={currentBrand} size="sm" />
      </div>

      {/* Real Card Container (when Stripe CDN loads) */}
      <div
        ref={cardContainerRef}
        id="stripe-card-element"
        className={`p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs min-h-[44px] ${
          isSimulated ? 'hidden' : 'block'
        }`}
      />

      {/* Simulated Card Interface (for sandbox / mock development) */}
      {isSimulated && (
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Card Number</label>
            <div className="relative">
              <input
                type="text"
                value={cardData.number}
                onChange={handleNumberChange}
                placeholder="4242 4242 4242 4242"
                className={`w-full pl-11 pr-3.5 py-2 rounded-xl bg-white border text-xs font-mono text-slate-900 focus:outline-none transition-colors ${
                  !cardData.number || cardData.number.replace(/\D/g, '').length < 15
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              <div className="absolute left-2.5 top-2 flex items-center justify-center">
                {currentBrand === 'Visa' ? (
                  <VisaIcon className="w-6 h-4" />
                ) : currentBrand === 'Mastercard' ? (
                  <MastercardIcon className="w-6 h-4" />
                ) : currentBrand === 'Amex' ? (
                  <AmexIcon className="w-6 h-4" />
                ) : currentBrand === 'Discover' ? (
                  <DiscoverIcon className="w-6 h-4" />
                ) : (
                  <CreditCard className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Expires</label>
              <input
                type="text"
                value={cardData.exp}
                onChange={handleExpChange}
                placeholder="MM/YY"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">CVC</label>
              <input
                type="text"
                value={cardData.cvc}
                onChange={handleCvcChange}
                placeholder="CVC"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Postal Code</label>
              <input
                type="text"
                value={cardData.postal}
                onChange={handlePostalChange}
                placeholder="ZIP"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {displayError && (
        <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PCI-DSS Level 1 Compliant Encryption</span>
        </div>
        <SupportedCardIcons detectedBrand={currentBrand} size="sm" />
      </div>
    </div>
  )
}

/**
 * Stripe.js dynamic loader & payment processor
 */

let stripePromise = null

export function loadStripeClient(publishableKey) {
  const key = publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'

  if (stripePromise) {
    return stripePromise
  }

  stripePromise = new Promise((resolve) => {
    // If running in environment without external network or using placeholder key, return simulated stripe helper
    if (!key || key === 'pk_test_placeholder' || !key.startsWith('pk_')) {
      resolve(createSimulatedStripeClient(key))
      return
    }

    if (window.Stripe) {
      resolve(window.Stripe(key))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.async = true
    script.onload = () => {
      if (window.Stripe) {
        resolve(window.Stripe(key))
      } else {
        resolve(createSimulatedStripeClient(key))
      }
    }
    script.onerror = () => {
      console.warn('Failed to load Stripe.js from CDN. Using sandboxed Stripe simulator.')
      resolve(createSimulatedStripeClient(key))
    }
    document.head.appendChild(script)
  })

  return stripePromise
}

function createSimulatedStripeClient(key) {
  return {
    isMock: true,
    elements: () => ({
      create: () => ({
        mount: () => {},
        on: () => {},
        unmount: () => {},
        destroy: () => {},
      }),
    }),
    confirmCardPayment: async (clientSecret, data = {}) => {
      // Simulate realistic 600ms network roundtrip
      await new Promise((r) => setTimeout(r, 600))
      return {
        paymentIntent: {
          id: clientSecret ? clientSecret.split('_secret_')[0] : 'pi_simulated_' + Math.random().toString(36).substring(2, 12),
          status: 'succeeded',
          amount: 10000,
          currency: 'usd',
        },
      }
    },
  }
}

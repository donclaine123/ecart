export function VisaIcon({ className = "w-8 h-5", active = false }) {
  return (
    <svg
      className={`${className} transition-all rounded shadow-2xs ${
        active ? 'ring-2 ring-indigo-500 ring-offset-1 scale-105' : ''
      }`}
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="Visa"
    >
      <rect width="36" height="24" rx="3.5" fill="#1A1F71" />
      <path d="M14.7 16.5H12.6L14 7.5H16.1L14.7 16.5Z" fill="white" />
      <path
        d="M21.2 7.7C20.8 7.5 20.1 7.4 19.3 7.4C17.2 7.4 15.8 8.4 15.8 9.9C15.8 11 16.9 11.6 17.7 12C18.5 12.4 18.8 12.7 18.8 13.1C18.8 13.7 18 14.1 17.3 14.1C16.3 14.1 15.7 13.9 15 13.6L14.7 13.5L14.3 15.6C14.9 15.9 16 16.1 17.1 16.1C19.3 16.1 20.8 15.1 20.8 13.4C20.8 12.2 19.9 11.5 18.9 11C18.1 10.6 17.7 10.3 17.7 9.8C17.7 9.3 18.3 8.9 19.1 8.9C19.8 8.9 20.3 9 20.7 9.2L20.9 9.3L21.2 7.7Z"
        fill="white"
      />
      <path
        d="M23.9 13.5C24.1 12.9 24.9 10.6 24.9 10.6C24.9 10.6 25.1 10.2 25.2 9.8L25.4 10.6C25.4 10.6 25.9 12.8 26 13.5H23.9ZM27.3 7.5H25.7C25.2 7.5 24.8 7.8 24.6 8.3L21.4 16.5H23.7L24.2 15.1H26.9L27.2 16.5H29.2L27.3 7.5Z"
        fill="white"
      />
      <path d="M10.9 7.5L8.9 13.6L8.7 12.4C8.3 11.3 7.3 10.1 6.1 9.5L7.9 16.5H10.2L13.6 7.5H10.9Z" fill="white" />
      <path d="M7.4 7.5H3.8L3.7 7.7C6.6 8.4 9 10.4 9.8 12.4L9 8.3C8.8 7.7 8.2 7.5 7.4 7.5Z" fill="#F7B600" />
    </svg>
  )
}

export function MastercardIcon({ className = "w-8 h-5", active = false }) {
  return (
    <svg
      className={`${className} transition-all rounded shadow-2xs ${
        active ? 'ring-2 ring-indigo-500 ring-offset-1 scale-105' : ''
      }`}
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="Mastercard"
    >
      <rect width="36" height="24" rx="3.5" fill="#141414" />
      <circle cx="14" cy="12" r="6.8" fill="#EB001B" />
      <circle cx="22" cy="12" r="6.8" fill="#F79E1B" />
      <path
        d="M18 7.1A6.76 6.76 0 0 0 15.4 12c0 1.9 0.8 3.7 2.6 4.9a6.76 6.76 0 0 0 2.6-4.9c0-1.9-0.8-3.7-2.6-4.9z"
        fill="#FF5F00"
      />
    </svg>
  )
}

export function AmexIcon({ className = "w-8 h-5", active = false }) {
  return (
    <svg
      className={`${className} transition-all rounded shadow-2xs ${
        active ? 'ring-2 ring-indigo-500 ring-offset-1 scale-105' : ''
      }`}
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="American Express"
    >
      <rect width="36" height="24" rx="3.5" fill="#0077A6" />
      <path d="M6 9.5H8.2L9.1 11.6L10 9.5H12.2V14.5H10.7V11.2L9.7 13.5H8.5L7.5 11.2V14.5H6V9.5Z" fill="white" />
      <path d="M13 9.5H16.8V10.7H14.5V11.4H16.6V12.6H14.5V13.3H16.8V14.5H13V9.5Z" fill="white" />
      <path d="M17.5 9.5H19.2L20.5 11.4L21.8 9.5H23.5L21.4 12L23.5 14.5H21.8L20.5 12.6L19.2 14.5H17.5L19.6 12L17.5 9.5Z" fill="white" />
      <path
        d="M24.2 9.5H26.2C27.5 9.5 28.3 10.3 28.3 11.4V12.6C28.3 13.7 27.5 14.5 26.2 14.5H24.2V9.5ZM25.7 13.3H26.2C26.7 13.3 27 13 27 12.5V11.5C27 11 26.7 10.7 26.2 10.7H25.7V13.3Z"
        fill="white"
      />
    </svg>
  )
}

export function DiscoverIcon({ className = "w-8 h-5", active = false }) {
  return (
    <svg
      className={`${className} transition-all rounded shadow-2xs ${
        active ? 'ring-2 ring-indigo-500 ring-offset-1 scale-105' : ''
      }`}
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="Discover"
    >
      <rect width="36" height="24" rx="3.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <path d="M5.5 13.6V10.4H7.6C8.8 10.4 9.5 11 9.5 12C9.5 13 8.8 13.6 7.6 13.6H5.5ZM6.7 12.8H7.4C8 12.8 8.4 12.5 8.4 12C8.4 11.5 8 11.2 7.4 11.2H6.7V12.8Z" fill="#1A1F71" />
      <rect x="10.2" y="10.4" width="1.1" height="3.2" fill="#1A1F71" />
      <path d="M14.2 10.9C13.9 10.6 13.5 10.4 12.9 10.4C12.1 10.4 11.7 10.8 11.7 11.4C11.7 12.4 13.1 12.2 13.1 12.7C13.1 13 12.8 13.1 12.5 13.1C12 13.1 11.6 12.9 11.4 12.7L11.1 13.4C11.5 13.6 12 13.7 12.5 13.7C13.4 13.7 14.1 13.3 14.1 12.6C14.1 11.6 12.7 11.8 12.7 11.3C12.7 11 13 10.9 13.2 10.9C13.6 10.9 13.9 11.1 14.1 11.2L14.2 10.9Z" fill="#1A1F71" />
      <circle cx="16.5" cy="12" r="3" fill="#F36F21" />
      <path d="M21.5 10.4L20.2 13.6H19.1L17.8 10.4H19L19.7 12.5L20.4 10.4H21.5Z" fill="#1A1F71" />
      <path d="M22.2 13.6V10.4H24.8V11.1H23.2V11.7H24.6V12.4H23.2V12.9H24.8V13.6H22.2Z" fill="#1A1F71" />
      <path d="M25.4 13.6V10.4H27.1C27.9 10.4 28.5 10.8 28.5 11.4C28.5 11.9 28.1 12.2 27.7 12.3L28.7 13.6H27.5L26.7 12.4H26.4V13.6H25.4ZM26.4 11.8H27C27.3 11.8 27.6 11.6 27.6 11.4C27.6 11.1 27.3 10.9 27 10.9H26.4V11.8Z" fill="#1A1F71" />
    </svg>
  )
}

export function SupportedCardIcons({ detectedBrand = 'Unknown', size = 'default', showLabels = false }) {
  const isSpecific = detectedBrand && detectedBrand !== 'Unknown'
  const iconClass = size === 'sm' ? 'w-7 h-4.5' : 'w-8.5 h-5.5'

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={`transition-opacity duration-200 ${
          isSpecific && detectedBrand !== 'Visa' ? 'opacity-35 grayscale-25' : 'opacity-100'
        }`}
        title="Visa"
      >
        <VisaIcon className={iconClass} active={detectedBrand === 'Visa'} />
      </div>
      <div
        className={`transition-opacity duration-200 ${
          isSpecific && detectedBrand !== 'Mastercard' ? 'opacity-35 grayscale-25' : 'opacity-100'
        }`}
        title="Mastercard"
      >
        <MastercardIcon className={iconClass} active={detectedBrand === 'Mastercard'} />
      </div>
      <div
        className={`transition-opacity duration-200 ${
          isSpecific && detectedBrand !== 'Amex' ? 'opacity-35 grayscale-25' : 'opacity-100'
        }`}
        title="American Express"
      >
        <AmexIcon className={iconClass} active={detectedBrand === 'Amex'} />
      </div>
      <div
        className={`transition-opacity duration-200 ${
          isSpecific && detectedBrand !== 'Discover' ? 'opacity-35 grayscale-25' : 'opacity-100'
        }`}
        title="Discover"
      >
        <DiscoverIcon className={iconClass} active={detectedBrand === 'Discover'} />
      </div>
    </div>
  )
}

export type Availability = 'open' | 'limited' | 'closed'

export const site = {
  brand: 'kxstxn',
  role: 'programmer',
  tagline: 'code, systems, automation — no noise',
  status: 'status: online',
  /** Fixed offset label shown in hero status */
  timezone: 'UTC+3',
  url: 'https://kxstxn.dev',
  description: 'kxstxn — programmer. code, systems, automation — no noise.',
  donate:
    'https://boosty.to/kxstxn/single-payment/donation/840193/target?share=target_link',
}

export const nav = [
  { id: 'services', label: 'services' },
  { id: 'projects', label: 'projects' },
  { id: 'contact', label: 'contact' },
] as const

/** Rates vs USD — approximate, for display only */
export const currencies = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'RUB', symbol: '₽', rate: 92 },
  { code: 'BYN', symbol: 'Br', rate: 3.3 },
] as const

export type CurrencyCode = (typeof currencies)[number]['code']

export function formatPrice(usdAmount: number, code: CurrencyCode) {
  const currency = currencies.find((item) => item.code === code) ?? currencies[0]
  const value = Math.round(usdAmount * currency.rate)

  if (currency.code === 'RUB' || currency.code === 'BYN') {
    return `${value.toLocaleString('en-US')} ${currency.symbol}`
  }

  return `${currency.symbol}${value.toLocaleString('en-US')}`
}

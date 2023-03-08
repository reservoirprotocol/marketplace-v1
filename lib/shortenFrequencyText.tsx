export default function shortenFrequencyText(freq: string | undefined) {
  if (!freq) return

  switch (freq) {
    case 'Hourly':
      return 'hr'
    case 'Twice Daily':
      return '12 hrs'
    case 'Daily':
      return 'day'
    case 'Weekly':
      return 'wk'
    case 'Monthly':
      return 'mo'
  }
}

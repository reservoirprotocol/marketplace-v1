export default function shortenFrequencyText(freq: string | undefined) {
  if (!freq) return

  switch (freq) {
    case 'Hourly':
      return '1hr'
    case 'Twice Daily':
      return '12hr'
    case 'Daily':
      return '1d'
    case 'Weekly':
      return '1w'
    case 'Monthly':
      return '1mo'
  }
}

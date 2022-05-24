const truncateFromMiddle = function (
  text: string,
  maxLength: number,
  separator: string = '...'
) {
  if (text.length <= maxLength) return text

  const sepLen = separator.length,
    charsToShow = maxLength - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2)

  return (
    text.substring(0, frontChars) +
    separator +
    text.substring(text.length - backChars)
  )
}

export { truncateFromMiddle }

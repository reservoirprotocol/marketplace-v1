/**
 * If images are stored in Google's servers, optimize
 * their size to reduce load time
 * @param imageHref An image url
 * @param width Desired image width
 * @returns The same image with an additional query param to resize it
 */
export function optimizeImage(
  imageHref: string | undefined,
  obj: { sm: number; md: number; lg: number; xl: number; '2xl': number }
) {
  if (!imageHref) return ''

  const w =
    window?.innerWidth < 639
      ? obj.sm
      : window?.innerWidth < 767
      ? obj.md
      : window?.innerWidth < 1023
      ? obj.lg
      : window?.innerWidth < 1279
      ? obj.xl
      : obj['2xl']

  let url = new URL(imageHref)
  // Optimize google images
  if (url.host === 'lh3.googleusercontent.com') {
    if (imageHref.includes('=s') || imageHref.includes('=w')) {
      let newImage = imageHref.split('=')
      return `${newImage[0]}=w${w}`
    }
    return `${imageHref}=w${w}`
  }
  return imageHref
}

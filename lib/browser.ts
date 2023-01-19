export const isSafariBrowser = () =>
  typeof window !== 'undefined' &&
  navigator.userAgent.indexOf('Safari') > -1 &&
  navigator.userAgent.indexOf('Chrome') <= -1

import tinycolor from 'tinycolor2'

export default function getColor(hexColor: string, amount: string) {
  let color = tinycolor(hexColor)
  const brightness = color.getBrightness()
  let textColor
  
  if (brightness > 50 && brightness < 200) textColor = color.darken(20).toString()
  if (brightness >= 200) textColor = color.darken(45).toString()
  if (brightness <= 50) textColor = color.lighten(75).toString()

  return textColor
}
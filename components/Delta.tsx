import { FiniliarMetadata } from "lib/fetchFromFiniliar"
import getAttributeFromFreshData from "lib/getAttributeFromFreshData"
import shortenFrequencyText from "lib/shortenFrequencyText"
import React, { FC } from "react"
import { DownArrow, UpArrow } from "./Icons"
// import { finiliar } from 'colors'
import tinycolor from "tinycolor2"
import { finiliar } from 'colors'

type Props = {
  delta: number,
  tokenData: FiniliarMetadata,
  useDefaultColors: boolean
}

export const Delta: FC<Props> = ({ delta, tokenData, useDefaultColors }) => {
  // const color = delta < 0 ? finiliar[900] : finiliar[500]
  const brightness = tinycolor(tokenData.background).getBrightness()

  let color = "#000000"

  if (useDefaultColors) {
    if (delta >= 0) {
      color = finiliar[500]
    } else {
      color = finiliar[900]
    }
  } else {
    if (brightness > 50 && brightness < 200) color = tinycolor(tokenData.background).darken(15).toString()
    if (brightness >= 200) color = tinycolor(tokenData.background).darken(45).toString()
    if (brightness <= 50) color = tinycolor(tokenData.background).lighten(75).toString()
  }

  return (
    <div style={{ color: color }} className={"inline-flex items-center space-x-1"}>
      {parseFloat(delta.toFixed(2)) > 0 &&
        <UpArrow color={color} />
      }
      {parseFloat(delta.toFixed(2)) < 0 &&
        <DownArrow color={color} />
      }
      <div>
        {delta.toFixed(2)}% / {shortenFrequencyText(getAttributeFromFreshData(tokenData.attributes, 'Frequency'))}
      </div>
    </div>
  )
}
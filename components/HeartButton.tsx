import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { useLocalStorageValue } from "@react-hookz/web"
import { useLocalStorage } from "hooks/useLocalStorage"
import { Heart, Heart2 } from './Icons'

type Props = {
  tokenId: string
}

const HeartButton: FC<Props> = ({ tokenId }) => {
  const [myTeam, updateMyTeam] = useLocalStorageValue('myTeam')
  let isOnMyTeam = false
  if (myTeam) {
    // @ts-ignore
    isOnMyTeam = myTeam.indexOf(tokenId) > -1
  }
  

  return (
    <div
        className="cursor-pointer pl-4"
        style={{ color: isOnMyTeam ? 'red' : ''}}
        onClick={() => {
          if (myTeam) {
            let newTeam = Object.assign([], myTeam)
            // either add or remove from team
            if (isOnMyTeam) {
              // @ts-ignore
              const indexOnTeam = newTeam.indexOf(tokenId)
              // @ts-ignore
              newTeam.splice(indexOnTeam, 1)
            } else {
              // @ts-ignore
              newTeam.push(tokenId)
            }
            updateMyTeam(newTeam)
          } else {
            updateMyTeam([tokenId])
          }
        }}
      >
        {isOnMyTeam ? <Heart2 /> : <Heart />}
      </div>
  )
}

export default HeartButton
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

type Props = {
  tokenId: string
}

const HeartButton: FC<Props> = ({ tokenId }) => {
  const [myTeam, updateMyTeam] = useLocalStorageValue('myTeam')
  return (
    <div
        className="cursor-pointer pl-4"
        // @ts-ignore
        style={{ color: myTeam.indexOf(tokenId) > -1 ? 'red' : ''}}
        onClick={() => {
          if (myTeam) {
            let newTeam = Object.assign([], myTeam)
            // either add or remove from team
            // @ts-ignore
            const indexOnTeam = newTeam.indexOf(tokenId)
            if (indexOnTeam > -1) {
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
        Heart
      </div>
  )
}

export default HeartButton
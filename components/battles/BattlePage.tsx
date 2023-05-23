import {
  NextPage
} from 'next'
import { Unity, useUnityContext } from "react-unity-webgl";
import React, {
  useState,
  useEffect,
  useCallback
} from 'react'
import useInterval from 'hooks/useInterval'

const BattlePage: NextPage = () => {
  const [battle, updateBattle] = useState()
  const [isStarted, updateIsStarted] = useState(false)
  const [creatorFini, updateCreatorFini] = useState()
  const [acceptorFini, updateAcceptorFini] = useState()
  const [winningState, updateWinningState] = useState("")
  const [isEnded, updateIsEnded] = useState(false)

  // SETUP AND START BATTLE ======================
  const { unityProvider, sendMessage, isLoaded, loadingProgression, addEventListener, removeEventListener } = useUnityContext({
      loaderUrl: "unityBuild/FinBattles_0.1a_WebGL.loader.js",
      dataUrl: "unityBuild/FinBattles_0.1a_WebGL.data",
      frameworkUrl: "unityBuild/FinBattles_0.1a_WebGL.framework.js",
      codeUrl: "unityBuild/FinBattles_0.1a_WebGL.wasm",
      streamingAssetsUrl: "unityBuild/StreamingAssets"
  });

  const fetchBattle = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const battleId = urlParams.get('id');
    const data = await fetch(`https://finiliar-server-staging.herokuapp.com/battles/${battleId}`);
    const jsonData = await data.json();
    updateBattle(jsonData)
    return jsonData
  }

  useEffect(() => {
    const fetchData = async () => {
      const jsonData = await fetchBattle()

      const creatorFini = await fetch(`https://api.finiliar.com/metadata/${jsonData.creatorFiniId}`);
      const creatorFiniData = await creatorFini.json()
      updateCreatorFini(creatorFiniData)

      const acceptorFini = await fetch(`https://api.finiliar.com/metadata/${jsonData.acceptorFiniId}`);
      const acceptorFiniData = await acceptorFini.json()
      updateAcceptorFini(acceptorFiniData)
    }

    fetchData()
      .catch(console.error);
  }, [])

  useEffect(() => {
    if (isLoaded) {
      //@ts-ignore
      sendMessage('JavascriptHook', 'hide_all')
    }
  }, [isLoaded])

  useEffect(() => {
    if (isLoaded && battle && !isStarted && !isEnded) {
      //@ts-ignore
      sendMessage('JavascriptHook', 'set_battle_ids', `${battle.creatorFiniId}, ${battle.acceptorFiniId}`)
    }
  }, [isLoaded, battle, isStarted])

  //@ts-ignore
  const handleCharactersLoaded = useCallback(async () => {
    // Once the characters are loaded either start the battle or call the ending sequence straight away
    let battle = await fetchBattle()

    const shouldBeEnded = computeIsEnded(battle)
    if (!isStarted && !shouldBeEnded) {
      //@ts-ignore
      sendMessage('JavascriptHook', 'start_opening_sequence')
      setTimeout(() => {
        updateIsStarted(true)
      }, 2000)
    } else {
      //@ts-ignore
      sendMessage('JavascriptHook', 'start_ending_sequence', battle.winner == battle.creator ? 'right' : 'left')
      setTimeout(() => {
        updateIsEnded(true)
      }, 2000)
    }
  }, [sendMessage]);
  
  useEffect(() => {
    addEventListener("dispatch_event", handleCharactersLoaded);
    return () => {
      removeEventListener("dispatch_event", handleCharactersLoaded);
    };
  }, [addEventListener, removeEventListener, handleCharactersLoaded]);

  // UPDATE BATTLE ======================
  const calculateWinner = async () => {
    await fetchBattle()

    //@ts-ignore
    const diff = Math.abs(battle!.creatorAssetDelta - battle.acceptorAssetDelta)
    let newState = ''

    if (diff == 0) return

    // TODO
    //@ts-ignore
    if (battle.winner == battle.creator) {
      if (diff > 5) {
        newState = 'left_winning_strongly'
      } else {
        newState = 'left_winning'
      }
    } else {
      if (diff > 5) {
        newState = 'right_winning_strongly'
      } else {
        newState = 'right_winning'
      }
    }

    if (newState != winningState) {
      sendMessage('JavascriptHook', newState)
      updateWinningState(newState)
    }
  }

  useInterval(() => {
    if (isStarted && !isEnded) {
      calculateWinner()
    }
  }, 3000)

  //@ts-ignore
  const computeIsEnded = (battle) => {
    //@ts-ignore
    const startDate = Date.parse(battle.startTime)
    //@ts-ignore
    const endDate = ((startDate / 1000) + battle.duration) * 1000
    console.log(endDate - Date.now())
    return endDate - Date.now() <= 0
  }

  useInterval(() => {
    const calculateEnding = async () => {
      if (computeIsEnded(battle) && !isEnded) {
        //@ts-ignore
        sendMessage('JavascriptHook', 'start_ending_sequence', battle.winner == battle.creator ? 'right' : 'left')
        updateIsEnded(true)
      }
    }

    if (isStarted && battle && !isEnded) {
      calculateEnding()
    }
  }, 1000)

    return (
      <div className="battleCanvas" style={{ position: "relative" }}>
        <div style={{ width: "100vw", height: "100vh", display: "flex", position: "absolute"}}>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
            Loading...
          </div>
          {/* @ts-ignore */}
          <div style={{ background: creatorFini ? creatorFini.background : "gray", flex: 1 }}/>
          {/* @ts-ignore */}
          <div style={{ background: acceptorFini ? acceptorFini.background : "gray", flex: 1 }}/>
        </div>
        <Unity devicePixelRatio={1.5} unityProvider={unityProvider} style={{ visibility: isStarted || isEnded ? "visible" : "hidden", position: "absolute" }} />
      </div>
    );
}

export default BattlePage
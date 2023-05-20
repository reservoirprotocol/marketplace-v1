import {
  NextPage
} from 'next'
import { Unity, useUnityContext } from "react-unity-webgl";
import React, {
  useState,
  useEffect,
  useCallback
} from 'react'

const BattlePage: NextPage = () => {
  const [battle, updateBattle] = useState()
  const [isStarted, updateIsStarted] = useState(false)
  const [creatorFini, updateCreatorFini] = useState()
  const [acceptorFini, updateAcceptorFini] = useState()

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
    if (isLoaded && battle) {
      //@ts-ignore
      sendMessage('JavascriptHook', 'set_battle_ids', `${battle.creatorFiniId}, ${battle.acceptorFiniId}`)
    }
  }, [isLoaded, battle])

  const handleCharactersLoaded = useCallback(() => {
    //@ts-ignore
    sendMessage('JavascriptHook', 'start_opening_sequence')
    setTimeout(() => {
      updateIsStarted(true)
    }, 2000)
  }, [sendMessage]);
  
  useEffect(() => {
    addEventListener("dispatch_event", handleCharactersLoaded);
    return () => {
      removeEventListener("dispatch_event", handleCharactersLoaded);
    };
  }, [addEventListener, removeEventListener, handleCharactersLoaded]);

  // UPDATE BATTLE ======================
  useEffect(() => {
    if (isStarted) {
      setInterval(async () => {
        await fetchBattle()

        // TODO
        sendMessage('JavascriptHook', 'left_winning')
      }, 3000)
    }
  }, [isStarted])

  useEffect(() => {
    // TODO: if battle is finished, call finishing scripts
  })
  
  
    
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
        <Unity devicePixelRatio={1.5} unityProvider={unityProvider} style={{ visibility: isStarted ? "visible" : "hidden", position: "absolute" }} />
      </div>
    );
}

export default BattlePage
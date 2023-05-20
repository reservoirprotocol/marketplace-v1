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


  const { unityProvider, sendMessage, isLoaded, loadingProgression, addEventListener, removeEventListener } = useUnityContext({
      loaderUrl: "unityBuild/FinBattles_0.1a_WebGL.loader.js",
      dataUrl: "unityBuild/FinBattles_0.1a_WebGL.data",
      frameworkUrl: "unityBuild/FinBattles_0.1a_WebGL.framework.js",
      codeUrl: "unityBuild/FinBattles_0.1a_WebGL.wasm",
      streamingAssetsUrl: "unityBuild/StreamingAssets"
  });

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const battleId = urlParams.get('id');
      const data = await fetch(`https://finiliar-server-staging.herokuapp.com/battles/${battleId}`);
      const jsonData = await data.json();
      updateBattle(jsonData)

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
    // TODO: determine winner and set
    if (isStarted) {
      sendMessage('JavascriptHook', 'left_winning')
    }
  }, [isStarted])

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
    
    return (
      <div className="battleCanvas" style={{ position: "relative" }}>
        <div style={{ width: "100vw", height: "100vh", display: "flex", position: "absolute"}}>
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
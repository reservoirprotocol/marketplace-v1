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

  const { unityProvider, sendMessage, isLoaded, loadingProgression, addEventListene, removeEventListener } = useUnityContext({
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
      console.log(battleId)
      const data = await fetch(`https://finiliar-server-staging.herokuapp.com/battles/${battleId}`);
      const jsonData = await data.json();
      console.log("data", jsonData)
      updateBattle(jsonData)
    }

    fetchData()
      .catch(console.error);
  }, [])

  useEffect(() => {
    if (isLoaded && battle) {
      console.log('setting battle ids')
      //@ts-ignore
      sendMessage('FiniBattles', 'set_battle_ids', `${battle.creatorFiniId}, ${battle.acceptorFiniId}`)
    }
  }, [isLoaded])


  const handleCharactersLoaded = useCallback(() => {
    // Do something once characters loaded here
    console.log('characters loaded')
  }, []);
  
  useEffect(() => {
    addEventListener("dispatch_event", handleCharactersLoaded);
    return () => {
      removeEventListener("dispatch_event", handleCharactersLoaded);
    };
  }, [addEventListener, removeEventListener, handleCharactersLoaded]);
    
    return (
      <div className="battleCanvas">
        <Unity devicePixelRatio={1.5} unityProvider={unityProvider} style={{ visibility: isLoaded ? "visible" : "hidden" }} />
      </div>
    );
}

export default BattlePage
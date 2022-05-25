import useDetails from 'hooks/useDetails'
import { optimizeImage } from 'lib/optmizeImage'
import Script from 'next/script'
import { FC } from 'react'

type Props = {
  details: ReturnType<typeof useDetails>
  tokenOpenSea: {
    animation_url: string | null
    extension: string | null
  }
}

const TokenMedia: FC<Props> = ({ details, tokenOpenSea }) => {
  const token = details.data?.tokens?.[0]

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
      ></Script>
      <Script
        noModule
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer-legacy.js"
      ></Script>
      {tokenOpenSea?.extension === null ? (
        <img
          className="w-full rounded-2xl"
          src={optimizeImage(token?.token?.image, 533)}
        />
      ) : (
        <Media
          tokenOpenSea={tokenOpenSea}
          tokenImage={optimizeImage(token?.token?.image, 533)}
        />
      )}
    </div>
  )
}

export default TokenMedia

const Media: FC<{
  tokenOpenSea: {
    animation_url: any
    extension: any
  }
  tokenImage: string
}> = ({ tokenOpenSea, tokenImage }) => {
  const { animation_url, extension } = tokenOpenSea

  // VIDEO
  if (extension === 'mp4') {
    return (
      <video className="mb-4 w-[533px]" controls>
        <source src={animation_url} type="video/mp4" />
        Your browser does not support the
        <code>video</code> element.
      </video>
    )
  }

  // AUDIO
  if (extension === 'wav' || extension === 'mp3') {
    return (
      <div>
        <img className="mb-4 w-[533px] rounded-2xl" src={tokenImage} />
        <audio className="mb-4 w-full" controls src={animation_url}>
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      </div>
    )
  }

  // 3D
  if (extension === 'gltf' || extension === 'glb') {
    return (
      <model-viewer
        src={animation_url}
        ar
        ar-modes="webxr scene-viewer quick-look"
        // environment-image="https://modelviewer.dev/shared-assets/environments/moon_1k.hdr"
        poster={tokenImage}
        seamless-poster
        shadow-intensity="1"
        camera-controls
        enable-pan
      ></model-viewer>
    )
  }

  // HTML
  if (
    extension === 'html' ||
    extension === undefined ||
    extension === 'other'
  ) {
    return (
      <iframe
        className="mb-6 aspect-square w-full"
        height="533"
        width="533"
        src={animation_url}
        sandbox="allow-scripts"
      ></iframe>
    )
  }

  return null
}

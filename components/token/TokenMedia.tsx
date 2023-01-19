import { useTokens } from '@reservoir0x/reservoir-kit-ui'
import { optimizeImage } from 'lib/optmizeImage'
import Script from 'next/script'
import { FC } from 'react'
import { TokenDetails } from 'types/reservoir'

type Props = {
  token?: TokenDetails
}

const TokenMedia: FC<Props> = ({ token }) => {
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
      {token?.media === null ? (
        <img
          alt="Token Image"
          className="w-full rounded-2xl"
          src={optimizeImage(token?.image, 533)}
        />
      ) : (
        <Media
          media={token?.media as string}
          tokenImage={optimizeImage(token?.image, 533)}
        />
      )}
    </div>
  )
}

export default TokenMedia

const Media: FC<{
  media: string
  tokenImage: string
}> = ({ media, tokenImage }) => {
  const matches = media.match('(\\.[^.]+)$')
  const extension = matches ? matches[0].replace('.', '') : null

  // VIDEO
  if (extension === 'mp4') {
    return (
      <video
        className="mb-4 w-full rounded"
        poster={tokenImage}
        controls
        autoPlay
        loop
        playsInline
        muted
      >
        <source src={media} type="video/mp4" />
        Your browser does not support the
        <code>video</code> element.
      </video>
    )
  }

  // AUDIO
  if (extension === 'wav' || extension === 'mp3') {
    return (
      <div>
        <img
          alt="Token Audio"
          className="mb-4 w-[533px] rounded-2xl"
          src={tokenImage}
        />
        <audio className="mb-4 w-full" controls src={media}>
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
        src={media}
        ar
        ar-modes="webxr scene-viewer quick-look"
        poster={tokenImage}
        seamless-poster
        shadow-intensity="1"
        camera-controls
        enable-pan
      ></model-viewer>
    )
  }

  //Image
  if (
    extension === 'png' ||
    extension === 'jpeg' ||
    extension === 'jpg' ||
    extension === 'gif'
  ) {
    return (
      <img
        alt="Token Image"
        className="w-full rounded-2xl"
        src={optimizeImage(media, 533)}
      />
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
        className="mb-6 aspect-square h-full w-full rounded-2xl"
        height="533"
        width="533"
        src={media}
        sandbox="allow-scripts"
      ></iframe>
    )
  }

  return (
    <img
      alt="Token Image"
      className="w-full rounded-2xl"
      src={optimizeImage(tokenImage, 533)}
    />
  )
}

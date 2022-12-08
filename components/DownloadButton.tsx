import React, { useEffect } from 'react';
import { FC, ReactElement, useState } from 'react'

type Props = {
  gifLink: string | undefined,
  children: ReactElement,
  filename: string
}

export const DownloadButton: FC<Props> = ({ gifLink, children, filename }) => {
  // Use the useState hook to store the GIF data and the URL for the GIF
  const [gifData, setGifData] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);

  console.log(gifLink)

  // Make a request to the server where the GIF is hosted to retrieve the GIF data
  useEffect(() => {
    if (!gifLink) return
    console.log('running')
    fetch(gifLink)
    .then((response) => response.arrayBuffer())
    .then((data) => {
      // @ts-ignore
      setGifData(data);
      // @ts-ignore
      setGifUrl(URL.createObjectURL(new Blob([data])));
    });
  }, [gifLink])

  if (!gifData || !gifUrl) return null

  return (
    <div>
      <a href={gifUrl} download={filename} className="inline-flex mt-2 items-center hover:opacity-75">
        <img src="/icons/FileSmile.svg" className="h-[16px] mr-[5px]" alt="File icon" />
        {children}
      </a>
    </div>
  );
}
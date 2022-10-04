import React, { useEffect } from 'react'

const WINTER_ENABLED = process.env.NEXT_PUBLIC_ENABLE_WINTER
function openWinterCheckout() {
  const iframe = document.getElementById('winter-checkout');
  if (!iframe) return null
  iframe.style.visibility = 'visible';
  iframe.style.display = 'inline';
}

interface IProps {
  title?: string
  buttonClassName?: string
  collection?: string
  tokenId?: string
  buyer?: string
}

export default function WinterBuy({
  title,
  buttonClassName,
  collection,
  tokenId,
  buyer,
}: IProps) {
  useEffect(() => {
    if (!window?.document || !collection || !tokenId) return
    if (!!document.getElementById('winter-checkout')) {
      const winterIframe = document.getElementById('winter-checkout') as HTMLIFrameElement
      console.log("CHANGING THE SRC ON WINTER FRAME")
      winterIframe.src = `https://production-marketplace-nft-checkout.onrender.com/?contractAddress=${collection}&tokenId=${tokenId}${!!buyer ? `&walletAddress=${buyer}` : ''}`
      return
    }

    const root = document.getElementById("__next")
    const winterIframe = document.createElement('iframe');
    winterIframe.id = 'winter-checkout';
    winterIframe.src = `https://production-marketplace-nft-checkout.onrender.com/?contractAddress=${collection}&tokenId=${tokenId}${!!buyer ? `&walletAddress=${buyer}` : ''}`
    winterIframe.setAttribute('allowtransparency', 'true')
    winterIframe.style.cssText = `
      position: fixed;
      top: 0px;
      bottom: 0px;
      right: 0px;
      width: 100%;
      border: none;
      margin: 0;
      padding: 0;
      overflow: hidden;
      z-index: 999999;
      height: 100%;
      visibility:hidden;
      display: none;
      `;

    if (!root) return

    root.appendChild(winterIframe);
    window.addEventListener('message', (event) => {
      const el = document.getElementById('winter-checkout')
      if (!el) return null
      if (event.data === 'closeWinterCheckoutModal') {
        el.style.visibility = 'hidden';
        el.style.display = 'none';
      }
    });

  }, [collection, tokenId, buyer])

  if (!WINTER_ENABLED) return null
  if (!collection || !tokenId) return null

  return (
    <button onClick={openWinterCheckout} className={buttonClassName}>{title ?? 'Buy with Credit Card'}</button>
  )
}
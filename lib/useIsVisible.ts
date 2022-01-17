import { useEffect, useRef, useState } from 'react'

export default function useIsVisible(options?: IntersectionObserverInit) {
  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const callbackFunction: IntersectionObserverCallback = (entries) => {
    const [entry] = entries
    setIsVisible(entry.isIntersecting)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options)

    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current)
    }
  }, [containerRef, options])

  return { containerRef, isVisible }
}

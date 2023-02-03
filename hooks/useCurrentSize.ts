import { useState, useEffect } from 'react';



export function useCurrentSize() {
  let [width, setWidth] = useState(0);
  let [height, setHeight] = useState(0);


  // in this case useEffect will execute only once because
  // it does not have any dependencies.
  useEffect(() => {
    const getWidth = () => window.innerWidth 
    || document.documentElement.clientWidth 
    || document.body.clientWidth;

    const getHeight = () => window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

      // save current window width in the state object
  

    // let timeoutId = "timer";
    const resizeListener = () => {
      // prevent execution of previous setTimeout
      // clearTimeout(timeoutId);
      // change width from the state object after 150 milliseconds
      // timeoutId = setTimeout(() => {
        setHeight(getHeight())
        setWidth(getWidth())
      } //, 150);
    // };
    // set resize listener
    window.addEventListener('resize', resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener('resize', resizeListener);
    }
  }, [])

  return { width, height };
}
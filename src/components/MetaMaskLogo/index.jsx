import { useEffect, useRef } from "react";
import ModelViewer from '@metamask/logo'

export const MetaMaskLogo = () => {
  const metaMaskRef = useRef()

  useEffect(() => {
    // To render with fixed dimensions:
    const viewer = ModelViewer({
      // Dictates whether width & height are px or multiplied
      pxNotRatio: true,
      width: 100,
      height: 80,
      // pxNotRatio: false,
      // width: 0.9,
      // height: 0.9,
      // To make the face follow the mouse.
      followMouse: false,
      // head should slowly drift (overrides lookAt)
      slowDrift: false,
    })
    viewer.setFollowMouse(true)
    if (metaMaskRef.current.childNodes?.length === 0) {
      metaMaskRef.current.appendChild(viewer.container)
    }
    return () => {
      viewer.stopAnimation()
    }
  }, [])

  return <div ref={metaMaskRef} />;
};

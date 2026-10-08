import React from 'react'
import AboutUs from "../../assets/About/about.png"


const ImgCard = () => {
  return (
    <div className="w-full overflow-hidden">
      <img
        src={AboutUs}
        alt="About Us"
        className="block h-auto w-full"
        decoding="async"
      />
    </div>
  )
}

export default ImgCard
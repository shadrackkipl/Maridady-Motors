import React, { useState } from 'react'
import CarSearch from '../components/Carlisting/CarSearch'
import Suv from '../components/Carlisting/Suv'
import Hatchbacks from '../components/Carlisting/Hatchbacks'
import Salooncar from '../components/Carlisting/Salooncar'
import Stationwagon from '../components/Carlisting/Stationwagon'
import Pickuptruck from '../components/Carlisting/Pickuptruck'
import Minivan from '../components/Carlisting/Minivan'
import Commercialvehicle from '../components/Carlisting/Commercialvehicle'

const CarListing = () => {
  const [searching, setSearching] = useState(false)

  return (
    <div className='bg-[#f5f5f0]'>
      <CarSearch onActiveChange={setSearching} />

      {!searching && (
        <>
          <Salooncar />
          <Stationwagon />
          <Suv />
          <Hatchbacks />
          <Commercialvehicle />
          <Pickuptruck />
          <Minivan />
        </>
      )}
    </div>
  )
}

export default CarListing
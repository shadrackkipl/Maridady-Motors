import React from 'react'
import Suv from '../components/Carlisting/Suv'
import Hatchbacks from '../components/Carlisting/Hatchbacks'
import Salooncar from '../components/Carlisting/Salooncar'

const CarListing = () => {
  return (
    <div className='bg-[#f5f5f0]'>
      <Salooncar/>
      <Suv />
      <Hatchbacks />
    </div>
  )
}

export default CarListing
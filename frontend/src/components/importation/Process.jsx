import React from 'react'
import Steps from './Steps'

function Process() {
  return (
    <section id="process" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-12">
      <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
        From auction floor to your driveway
      </h2>
      <p className="mt-3 max-w-xl text-slate-600">
        Six stages, and you approve the important ones.
      </p>
      <Steps />
    </section>
  )
}

export default Process
import React from 'react'
import { FadeLoader } from "react-spinners";

export default function Loader() {
  return (
    <div className='w-100 d-flex justify-content-center py-5'>
        <FadeLoader color='teal' />
    </div>
  )
}

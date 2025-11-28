import React from 'react'
import {useParams} from 'react-router-dom'

export default function Deliver() {

    const {orderId} = useParams()

    console.log(orderId);
    


  return (
    <div>Deliver</div>
  )
}

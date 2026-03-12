import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyShowsData, dummyDateTimeData, assets } from '../assets/assets'
import Loading from '../components/Loading'
import { ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const SeatLayout = () => {

  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]

  const { id, date } = useParams()
  const navigate = useNavigate()

  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)

  const handleSeatClick = (seatId) => {

    if (!selectedTime) {
      return toast('Please select a time first')
    }

    // limit to 5 seats
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast("You can only select 5 seats")
    }

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(seat => seat !== seatId)
        : [...prev, seatId]
    )
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }).map((_, i) => {
          const seatId = `${row}${i + 1}`

          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer 
            ${selectedSeats.includes(seatId)
                  ? "bg-primary text-white"
                  : "hover:bg-primary/20"
                }`}
            >
              {seatId}
            </button>
          )
        })}
      </div>
    </div>
  )

  // Fetch Show Data
  useEffect(() => {
    const foundShow = dummyShowsData.find(
      item => item.id.toString() === id   // ✅ Fix ID match
    )

    if (foundShow) {
      setShow({
        movie: foundShow,
        dateTime: dummyDateTimeData
      })
    }
  }, [id])

  if (!show) return <Loading />

  // ✅ Convert index → real date key
  const dateKeys = Object.keys(show.dateTime)
  const selectedDateKey = dateKeys[Number(date)]
  const timings = show.dateTime[selectedDateKey] || []

  return (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-24 md:pt-40'>

      {/* Available Timings */}
      <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-8 h-max md:sticky md:top-28'>

        <p className='text-lg font-semibold px-6'>Available Timings</p>

        <div className='mt-5 space-y-2'>
          {timings.length > 0 ? (
            timings.map((item, index) => (
              <div
                key={index}
                onClick={() => setSelectedTime(item)}
                className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition
              ${selectedTime?.time === item.time
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/20'
                  }`}
              >
                <ClockIcon className="w-4 h-4" />
                <p className='text-sm'>{isoTimeFormat(item.time)}</p>
              </div>
            ))
          ) : (
            <p className="px-6 text-sm text-gray-500">
              No timings available
            </p>
          )}
        </div>
      </div>

      {/* Seat Layout */}
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
        <BlurCircle top='-100px' left='-100px' />
        <BlurCircle bottom='0px' right='0px' />

        <h1 className='text-2xl font-semibold mb-4'>Select your seat</h1>
        <img src={assets.screenImage} alt="screen" />
        <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>

        <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>

          <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
            {groupRows[0].map(row => renderSeats(row, 8))}
          </div>

          <div className='grid grid-cols-2 gap-11'>
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>
                {group.map(row => renderSeats(row))}
              </div>
            ))}
          </div>

        </div>

        <button onClick={()=> navigate('/my-bookings')} className='flex items-center gap-1  mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />

        </button>
      </div>

    </div>
  )
}

export default SeatLayout
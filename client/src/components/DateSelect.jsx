import React, { useState } from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  const dates = Object.keys(dateTime || {})

  const onBookHandler = () => {
    if (!selected) {
      return toast.error('Please select a date') // ✅ Changed to toast.error
    }

    // ✅ FIX: Navigate using the actual date string key (e.g., "2026-03-25")
    // This matches the Route: /seat-layout/:id/:date
    navigate(`/seat-layout/${id}/${selected}`)
    
    // Scroll to top so the user sees the seat map immediately
    window.scrollTo(0, 0)
  }

  return (
    <div id='dateSelect' className='pt-30'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
        
        <BlurCircle top='-100px' left='-100px' />
        <BlurCircle top='-100px' right='0px' />

        <div>
          <p className='text-lg font-semibold'>Choose Date</p>

          <div className='flex items-center gap-6 text-sm mt-5'>
            <ChevronLeftIcon className="w-7 h-7 cursor-pointer hover:text-primary transition" />

            <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
              {dates.map((date) => {
                const d = new Date(date)
                return (
                  <button
                    key={date}
                    onClick={() => setSelected(date)}
                    className={`flex flex-col items-center justify-center h-14 w-14 rounded cursor-pointer transition border ${
                      selected === date
                        ? 'bg-primary text-white border-primary'
                        : 'border-primary/30 hover:bg-primary/20 text-gray-300'
                    }`}
                  >
                    <span className="font-bold">{d.getDate()}</span>
                    <span className="text-[10px] uppercase">
                      {d.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </button>
                )
              })}
            </span>

            <ChevronRightIcon className="w-7 h-7 cursor-pointer hover:text-primary transition" />
          </div>
        </div>

        <button
          onClick={onBookHandler}
          disabled={!selected}
          className='bg-primary text-white px-10 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Book Now
        </button>
      </div>
    </div>
  )
}

export default DateSelect
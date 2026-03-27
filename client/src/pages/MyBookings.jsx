import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import { Calendar, Ticket, Clock, ReceiptText, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const { axios } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      // ✅ FIX 1: correct endpoint is /api/booking/user not /api/booking/list
      // ✅ FIX 2: no need to manually pass token — axios interceptor handles it
      const { data } = await axios.get('/api/booking/user')
      if (data.success) setBookings(data.bookings)
    } catch (error) {
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  if (loading) return <Loading />

  return (
    <div className='min-h-screen bg-[#020202] text-white pt-32 pb-20 px-6 md:px-20 lg:px-40'>
      <div className="flex items-center gap-4 mb-12">
        <ReceiptText className="w-8 h-8 text-primary" />
        <h1 className='text-4xl font-black uppercase tracking-tighter'>My Tickets</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-24 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
          <Ticket className="w-16 h-16 mx-auto text-gray-800 mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active bookings found</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-10'>
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className='flex flex-col md:flex-row bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group hover:border-primary/20 transition-all duration-500'
            >
              {/* Left: Poster */}
              <div className='w-full md:w-52 h-72 md:h-auto shrink-0 relative'>
                <img
                  // ✅ FIX 3: use booking.show.movie.poster directly (not poster_path)
                  src={booking.show?.movie?.poster}
                  className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700'
                  alt={booking.show?.movie?.title}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Image' }}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent'></div>
              </div>

              {/* Right: Ticket Body */}
              <div className='flex-grow p-8 flex flex-col justify-between relative'>

                {/* Perforation Effect */}
                <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-[#020202] rounded-full border-r border-white/5"></div>

                <div>
                  <div className='flex justify-between items-start mb-4'>
                    <h2 className='text-2xl font-black leading-tight uppercase italic tracking-tighter'>
                      {booking.show?.movie?.title}
                    </h2>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20 shrink-0 ml-2">
                      {booking.isPaid ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>

                  <div className='space-y-3 mt-6'>
                    <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                      <Calendar className='w-4 h-4 text-primary shrink-0' />
                      {/* ✅ FIX 4: use booking.show.date instead of showDateTime */}
                      {booking.show?.date || 'N/A'}
                    </div>
                    <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                      <Clock className='w-4 h-4 text-primary shrink-0' />
                      {booking.show?.time || 'N/A'}
                    </div>
                    <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                      <Ticket className='w-4 h-4 text-primary shrink-0' />
                      Seats: <span className='text-white ml-1'>{booking.bookedSeats?.join(', ')}</span>
                    </div>
                    <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                      <MapPin className='w-4 h-4 text-primary shrink-0' />
                      Amount: <span className='text-white ml-1'>${booking.amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer with Booking ID & QR */}
                <div className='mt-8 pt-6 border-t border-dashed border-white/10 flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] text-gray-600 uppercase font-black tracking-[0.2em] mb-1'>Booking Reference</p>
                    <p className='text-xs font-mono text-gray-400'>#{booking._id?.slice(-10).toUpperCase()}</p>
                  </div>
                  <div className='w-14 h-14 bg-white p-1.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]'>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking._id}`}
                      alt="QR Code"
                      className='w-full h-full'
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings
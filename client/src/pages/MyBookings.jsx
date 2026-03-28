import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import { Calendar, Ticket, Clock, ReceiptText, MapPin, Download, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// ── Helper: fetch image as base64 (bypasses CORS for html2canvas) ──
const toBase64 = (url) => new Promise((resolve) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width  = img.naturalWidth
    canvas.height = img.naturalHeight
    canvas.getContext('2d').drawImage(img, 0, 0)
    resolve(canvas.toDataURL('image/jpeg', 0.9))
  }
  img.onerror = () => resolve('') // fallback to empty if blocked
  img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now()
})

// ── Download ticket as PDF ───────────────────────────────────
const downloadTicket = async (booking) => {
  const movie  = booking.show?.movie?.title || 'Movie'
  const date   = booking.show?.date || 'N/A'
  const time   = booking.show?.time || 'N/A'
  const seats  = booking.bookedSeats?.join(', ') || 'N/A'
  const amount = `$${booking.amount?.toFixed(2)}`
  const ref    = `#${booking._id?.slice(-10).toUpperCase()}`
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking._id}`

  toast.loading('Generating PDF...')

  // ✅ FIX: convert both images to base64 BEFORE building the div
  // html2canvas cannot load external images due to CORS — base64 bypasses this
  const [posterB64, qrB64] = await Promise.all([
    toBase64(booking.show?.movie?.poster || ''),
    toBase64(qrUrl),
  ])

  const div = document.createElement('div')
  div.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:680px;height:280px;background:#111;overflow:hidden;display:flex;font-family:Arial,sans-serif;'

  div.innerHTML = `
    <div style="width:200px;flex-shrink:0;background:#1a1a1a;">
      ${posterB64
        ? `<img src="${posterB64}" style="width:200px;height:280px;object-fit:cover;display:block;"/>`
        : `<div style="width:200px;height:280px;background:#222;display:flex;align-items:center;justify-content:center;color:#444;font-size:12px;">No Image</div>`
      }
    </div>
    <div style="flex:1;padding:28px;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;">
          <div style="font-size:18px;font-weight:900;color:#fff;text-transform:uppercase;font-style:italic;letter-spacing:-0.02em;line-height:1.1;max-width:240px;">${movie}</div>
          <div style="background:#e50914;color:#fff;font-size:8px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:4px 10px;border-radius:20px;white-space:nowrap;">Confirmed</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;">
          <div><div style="font-size:8px;color:#555;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;margin-bottom:3px;">Date</div><div style="font-size:12px;color:#ccc;font-weight:600;">${date}</div></div>
          <div><div style="font-size:8px;color:#555;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;margin-bottom:3px;">Time</div><div style="font-size:12px;color:#ccc;font-weight:600;">${time}</div></div>
          <div><div style="font-size:8px;color:#555;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;margin-bottom:3px;">Seats</div><div style="font-size:12px;color:#fff;font-weight:700;">${seats}</div></div>
          <div><div style="font-size:8px;color:#555;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;margin-bottom:3px;">Amount</div><div style="font-size:14px;color:#fff;font-weight:900;">${amount}</div></div>
        </div>
      </div>
      <div>
        <div style="border-top:1px dashed #2a2a2a;margin-bottom:14px;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:7px;color:#444;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;margin-bottom:3px;">Booking Reference</div>
            <div style="font-family:monospace;font-size:11px;color:#555;">${ref}</div>
            <div style="font-size:22px;font-weight:900;color:#fff;margin-top:6px;">${amount}</div>
          </div>
          ${qrB64
            ? `<div style="background:#fff;padding:4px;border-radius:8px;width:60px;height:60px;"><img src="${qrB64}" style="width:100%;height:100%;display:block;"/></div>`
            : ''
          }
        </div>
      </div>
    </div>`

  document.body.appendChild(div)

  try {
    const canvas = await html2canvas(div, {
      scale: 2,
      useCORS: false,       // false because we already converted to base64
      allowTaint: false,
      backgroundColor: '#111',
      logging: false,
    })
    document.body.removeChild(div)

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [680, 280] })
    pdf.addImage(imgData, 'PNG', 0, 0, 680, 280)
    pdf.save(`ticket-${booking._id?.slice(-6)}.pdf`)

    toast.dismiss()
    toast.success('PDF ticket downloaded!')
  } catch (err) {
    if (document.body.contains(div)) document.body.removeChild(div)
    toast.dismiss()
    toast.error('Failed to generate PDF')
    console.error(err)
  }
}

const MyBookings = () => {
  const { axios, user } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('confirmed')

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/booking/user')
      if (data.success) setBookings(data.bookings)
      else setBookings([])
    } catch {
      toast.error('Failed to load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIX: wait for user to be loaded before fetching
  // Without this, the axios interceptor has no token yet → 401
  useEffect(() => {
    if (user) fetchBookings()
    else setLoading(false)
  }, [user])

  if (loading) return <Loading />

  const confirmed = bookings.filter(b => b.isPaid)
  const pending   = bookings.filter(b => !b.isPaid)
  const shown     = tab === 'confirmed' ? confirmed : pending

  return (
    <div className='min-h-screen bg-[#020202] text-white pt-32 pb-20 px-6 md:px-20 lg:px-40'>

      {/* Header */}
      <div className='flex items-center gap-4 mb-8'>
        <ReceiptText className='w-8 h-8 text-primary' />
        <h1 className='text-4xl font-black uppercase tracking-tighter'>My Tickets</h1>
      </div>

      {/* Tabs */}
      <div className='flex gap-3 mb-10'>
        <button
          onClick={() => setTab('confirmed')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
            tab === 'confirmed'
              ? 'bg-primary border-primary text-white'
              : 'bg-white/5 border-white/10 text-gray-500 hover:border-primary/30'
          }`}
        >
          <CheckCircle2 className='w-3.5 h-3.5' />
          Confirmed
          {confirmed.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${tab === 'confirmed' ? 'bg-white/20' : 'bg-white/10'}`}>
              {confirmed.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
            tab === 'pending'
              ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
              : 'bg-white/5 border-white/10 text-gray-500 hover:border-yellow-500/30'
          }`}
        >
          <AlertCircle className='w-3.5 h-3.5' />
          Pending Payment
          {pending.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${tab === 'pending' ? 'bg-yellow-500/20' : 'bg-white/10'}`}>
              {pending.length}
            </span>
          )}
        </button>
      </div>

      {/* Empty state */}
      {shown.length === 0 ? (
        <div className='text-center py-24 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10'>
          <Ticket className='w-16 h-16 mx-auto text-gray-800 mb-4' />
          <p className='text-gray-500 font-bold uppercase tracking-widest text-xs'>
            {tab === 'confirmed' ? 'No confirmed bookings yet' : 'No pending payments'}
          </p>
        </div>
      ) : tab === 'confirmed' ? (
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
          {shown.map((booking) => (
            <div
              key={booking._id}
              className='flex flex-col md:flex-row bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group hover:border-primary/20 transition-all duration-500'
            >
              {/* Left: Poster */}
              <div className='w-full md:w-48 h-64 md:h-auto shrink-0 relative'>
                <img
                  src={booking.show?.movie?.poster}
                  className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700'
                  alt={booking.show?.movie?.title}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Image' }}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent'/>
              </div>

              {/* Right: Ticket Body */}
              <div className='flex-grow p-7 flex flex-col justify-between relative'>
                <div className='hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-[#020202] rounded-full border-r border-white/5'/>
                <div>
                  <div className='flex justify-between items-start mb-5'>
                    <h2 className='text-xl font-black leading-tight uppercase italic tracking-tighter pr-2'>
                      {booking.show?.movie?.title}
                    </h2>
                    <span className='px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 bg-primary/10 text-primary border-primary/20'>
                      Confirmed
                    </span>
                  </div>

                  {/* Info rows */}
                  <div className='space-y-2.5'>
                    <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                      <Calendar className='w-3.5 h-3.5 text-primary shrink-0'/> {booking.show?.date || 'N/A'}
                    </div>
                    <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                      <Clock className='w-3.5 h-3.5 text-primary shrink-0'/> {booking.show?.time || 'N/A'}
                    </div>
                    <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                      <Ticket className='w-3.5 h-3.5 text-primary shrink-0'/>
                      Seats: <span className='text-white ml-1'>{booking.bookedSeats?.join(', ')}</span>
                    </div>
                    <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                      <MapPin className='w-3.5 h-3.5 text-primary shrink-0'/>
                      Amount: <span className='text-white ml-1'>${booking.amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className='mt-6 pt-5 border-t border-dashed border-white/10'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <p className='text-[8px] text-gray-600 uppercase font-black tracking-[0.2em] mb-1'>Booking Ref</p>
                      <p className='text-xs font-mono text-gray-500'>#{booking._id?.slice(-10).toUpperCase()}</p>
                    </div>

                    <div className='flex items-center gap-2'>
                      {/* QR code — only for confirmed */}
                      {booking.isPaid && (
                        <div className='w-12 h-12 bg-white p-1 rounded-xl'>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking._id}`}
                            alt='QR'
                            className='w-full h-full'
                          />
                        </div>
                      )}

                      {/* Download button — confirmed only */}
                      {booking.isPaid && (
                        <button
                          onClick={() => downloadTicket(booking)}
                          className='flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200'
                        >
                          <Download className='w-3.5 h-3.5'/> Download
                        </button>
                      )}

                          </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Pending Payment — compact list ── */
        <div className='flex flex-col gap-4'>
          {shown.map((booking) => (
            <div key={booking._id}
              className='flex items-center gap-5 bg-[#0d0900] border border-yellow-900/20 hover:border-yellow-500/30 rounded-2xl p-4 transition-all duration-300'
            >
              {/* Small poster */}
              <div className='w-14 h-20 shrink-0 rounded-xl overflow-hidden relative'>
                <img
                  src={booking.show?.movie?.poster}
                  className='w-full h-full object-cover grayscale opacity-50'
                  alt={booking.show?.movie?.title}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/56x80?text=?' }}
                />
              </div>

              {/* Info */}
              <div className='flex-grow min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-[8px] font-black uppercase tracking-widest'>
                    Pending
                  </span>
                </div>
                <h3 className='text-sm font-black uppercase italic tracking-tight truncate'>{booking.show?.movie?.title}</h3>
                <div className='flex flex-wrap gap-x-4 gap-y-1 mt-2'>
                  <span className='text-[10px] text-gray-500 flex items-center gap-1'>
                    <Calendar className='w-3 h-3 text-yellow-600'/> {booking.show?.date}
                  </span>
                  <span className='text-[10px] text-gray-500 flex items-center gap-1'>
                    <Clock className='w-3 h-3 text-yellow-600'/> {booking.show?.time}
                  </span>
                  <span className='text-[10px] text-gray-500 flex items-center gap-1'>
                    <Ticket className='w-3 h-3 text-yellow-600'/> {booking.bookedSeats?.join(', ')}
                  </span>
                </div>
              </div>

              {/* Amount + Pay button */}
              <div className='shrink-0 flex flex-col items-end gap-2'>
                <p className='text-lg font-black text-white'>${booking.amount?.toFixed(2)}</p>
                {booking.paymentLink ? (
                  <a
                    href={booking.paymentLink}
                    target='_blank'
                    rel='noreferrer'
                    className='flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200'
                  >
                    <CreditCard className='w-3 h-3'/> Pay Now
                  </a>
                ) : (
                  <span className='text-[9px] text-gray-600 font-black uppercase tracking-widest'>Link expired</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings
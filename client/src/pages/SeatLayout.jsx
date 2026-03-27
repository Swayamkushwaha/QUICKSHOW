import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from '../components/Loading'
import { Clock, ChevronRight, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

// ── Seat type config ────────────────────────────────────────
const RECLINER_ROWS = ['G', 'H']
const NORMAL_ROWS   = ['A', 'B', 'C', 'D', 'E', 'F']
const RECLINER_COLS = 6
const NORMAL_COLS   = 9
const RECLINER_PRICE_EXTRA = 8  // added on top of base showPrice

// ── SVG seat shapes ─────────────────────────────────────────
const ReclinerSeat = ({ id, state }) => {
  const fill   = state === 'selected' ? '#e50914' : state === 'occupied' ? '#111' : '#1a1a1a'
  const stroke = state === 'selected' ? '#e50914' : state === 'occupied' ? '#1e1e1e' : '#3a3a3a'
  const textColor = state === 'selected' ? '#fff' : '#555'
  return (
    <svg width="34" height="34" viewBox="0 0 28 28">
      <rect x="2"  y="5"  width="24" height="16" rx="5" fill={fill} stroke={stroke} strokeWidth="1"/>
      <rect x="0"  y="9"  width="5"  height="9"  rx="2.5" fill={fill} stroke={stroke} strokeWidth="1"/>
      <rect x="23" y="9"  width="5"  height="9"  rx="2.5" fill={fill} stroke={stroke} strokeWidth="1"/>
      <rect x="7"  y="20" width="14" height="6"  rx="2" fill={fill} stroke={stroke} strokeWidth="1"/>
      {state === 'occupied' && <>
        <line x1="5"  y1="7"  x2="23" y2="20" stroke="#2a2a2a" strokeWidth="1.5"/>
        <line x1="23" y1="7"  x2="5"  y2="20" stroke="#2a2a2a" strokeWidth="1.5"/>
      </>}
      <text x="14" y="16" textAnchor="middle" fontSize="6.5" fill={textColor} fontFamily="sans-serif">{id}</text>
    </svg>
  )
}

const NormalSeat = ({ id, state }) => {
  const fill   = state === 'selected' ? '#e50914' : state === 'occupied' ? '#0f0f0f' : '#181818'
  const stroke = state === 'selected' ? '#e50914' : state === 'occupied' ? '#1a1a1a' : '#2e2e2e'
  const textColor = state === 'selected' ? '#fff' : '#555'
  return (
    <svg width="27" height="27" viewBox="0 0 22 24">
      <rect x="2"  y="7"  width="18" height="13" rx="4" fill={fill} stroke={stroke} strokeWidth="1"/>
      <rect x="0"  y="10" width="4"  height="8"  rx="2" fill={fill} stroke={stroke} strokeWidth="1"/>
      <rect x="18" y="10" width="4"  height="8"  rx="2" fill={fill} stroke={stroke} strokeWidth="1"/>
      <rect x="6"  y="18" width="10" height="5"  rx="2" fill={fill} stroke={stroke} strokeWidth="1"/>
      {state === 'occupied' && <>
        <line x1="4"  y1="8"  x2="18" y2="19" stroke="#252525" strokeWidth="1.5"/>
        <line x1="18" y1="8"  x2="4"  y2="19" stroke="#252525" strokeWidth="1.5"/>
      </>}
      <text x="11" y="16" textAnchor="middle" fontSize="6" fill={textColor} fontFamily="sans-serif">{id}</text>
    </svg>
  )
}

// ── Legend item ─────────────────────────────────────────────
const LegendItem = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#666' }}>
    {children}
    <span>{label}</span>
  </div>
)

const SeatLayout = () => {
  const { id, date } = useParams()
  const navigate = useNavigate()
  const { axios, getToken } = useAppContext()

  const [selectedSeats, setSelectedSeats] = useState([])
  const [occupiedSeats, setOccupiedSeats]  = useState([])
  const [selectedTime, setSelectedTime]    = useState(null)
  const [show, setShow]                    = useState(null)
  const [isLoading, setIsLoading]          = useState(true)

  const fetchShowData = async () => {
    try {
      setIsLoading(true)
      const { data } = await axios.get(`/api/shows/${id}`)
      if (data.success) {
        setShow(data)
        if (data.dateTime?.[date]) {
          setSelectedTime({ time: data.dateTime[date][0], showId: data.showIds[date][0] })
        }
      }
    } catch { toast.error('Error loading show details') }
    finally { setIsLoading(false) }
  }

  const fetchOccupiedSeats = async () => {
    if (!selectedTime?.showId) return
    try {
      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`)
      if (data.success) { setOccupiedSeats(data.occupiedSeats); setSelectedSeats([]) }
    } catch { console.error('Error fetching seats') }
  }

  useEffect(() => { fetchShowData() }, [id, date])
  useEffect(() => { fetchOccupiedSeats() }, [selectedTime])

  const getSeatState = (seatId) => {
    if (occupiedSeats.includes(seatId)) return 'occupied'
    if (selectedSeats.includes(seatId)) return 'selected'
    return 'available'
  }

  const toggleSeat = (seatId) => {
    if (occupiedSeats.includes(seatId)) return
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    )
  }

  const isRecliner = (seatId) => RECLINER_ROWS.includes(seatId[0])

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const base = show?.showPrice || 0
    return sum + base + (isRecliner(seatId) ? RECLINER_PRICE_EXTRA : 0)
  }, 0)

  const handleCheckout = async () => {
    try {
      if (!selectedTime || selectedSeats.length === 0)
        return toast.error('Please select at least one seat')
      const token = await getToken()
      if (!token) return toast.error('Please login to book tickets')
      const loadingToast = toast.loading('Connecting to secure payment...')
      const { data: response } = await axios.post('/api/booking/create', {
        showId: selectedTime.showId,
        selectedSeats,
      })
      toast.dismiss(loadingToast)
      if (response.success && response.url) {
        window.location.href = response.url
      } else {
        toast.error(response.message || 'Checkout failed')
      }
    } catch (error) {
      console.error('Checkout Error:', error.response?.data)
      toast.error('Unauthorized: Please refresh and try again')
    }
  }

  if (isLoading) return <Loading />

  const basePrice = show?.showPrice || 0

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', paddingTop: 100, paddingBottom: 160, fontFamily: 'sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 32px', borderBottom: '1px solid #111' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.03em', color: '#e50914', marginBottom: 16 }}>
          {show?.movie?.title}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e50914', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <CalendarDays size={14} /> {date}
            </div>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <Clock size={14} color="#e50914" /> {selectedTime?.time}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {show?.dateTime?.[date]?.map((time, i) => (
              <button key={i} onClick={() => setSelectedTime({ time, showId: show.showIds[date][i] })}
                style={{ padding: '7px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                  background: selectedTime?.time === time ? '#e50914' : 'rgba(255,255,255,0.04)',
                  borderColor: selectedTime?.time === time ? '#e50914' : 'rgba(255,255,255,0.1)',
                  color: selectedTime?.time === time ? '#fff' : '#666'
                }}>
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 0' }}>

        {/* Screen */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ height: 10, background: '#10102a', borderRadius: '50%', borderTop: '2px solid #e50914', boxShadow: '0 -10px 35px rgba(229,9,20,0.3)', maxWidth: 600, margin: '0 auto 10px' }}/>
          <p style={{ fontSize: 10, letterSpacing: '0.25em', color: '#2a2a2a', fontWeight: 600, textTransform: 'uppercase' }}>Screen</p>
        </div>

        {/* ── Normal Zone (front rows A-F) ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <span style={{ background: 'rgba(255,255,255,0.04)', color: '#777', border: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 18px', borderRadius: 20 }}>
              Standard — ${basePrice}
            </span>
          </div>
          {NORMAL_ROWS.map(row => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ width: 18, fontSize: 11, color: '#333', fontWeight: 600, textAlign: 'center' }}>{row}</span>
              {Array.from({ length: NORMAL_COLS }, (_, i) => {
                const seatId = `${row}${i + 1}`
                const state  = getSeatState(seatId)
                return (
                  <React.Fragment key={seatId}>
                    {i === 3 && <div style={{ width: 18 }}/>}
                    {i === 6 && <div style={{ width: 18 }}/>}
                    <button onClick={() => toggleSeat(seatId)} disabled={state === 'occupied'}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: state === 'occupied' ? 'not-allowed' : 'pointer', transition: 'transform 0.15s', transform: state === 'selected' ? 'scale(1.1)' : 'scale(1)' }}>
                      <NormalSeat id={seatId} state={state} />
                    </button>
                  </React.Fragment>
                )
              })}
              <span style={{ width: 18, fontSize: 11, color: '#333', fontWeight: 600, textAlign: 'center' }}>{row}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed #151515', margin: '8px 0 32px' }}/>

        {/* ── Recliner Zone (back rows G-H) ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <span style={{ background: 'rgba(229,9,20,0.1)', color: '#e50914', border: '1px solid rgba(229,9,20,0.2)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 18px', borderRadius: 20 }}>
              Recliner — ${basePrice + RECLINER_PRICE_EXTRA}
            </span>
          </div>
          {RECLINER_ROWS.map(row => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 18, fontSize: 11, color: '#333', fontWeight: 600, textAlign: 'center' }}>{row}</span>
              <div style={{ width: 18 }}/>
              {Array.from({ length: RECLINER_COLS }, (_, i) => {
                const seatId = `${row}${i + 1}`
                const state  = getSeatState(seatId)
                return (
                  <button key={seatId} onClick={() => toggleSeat(seatId)} disabled={state === 'occupied'}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: state === 'occupied' ? 'not-allowed' : 'pointer', transition: 'transform 0.15s', transform: state === 'selected' ? 'scale(1.1)' : 'scale(1)' }}>
                    <ReclinerSeat id={seatId} state={state} />
                  </button>
                )
              })}
              <span style={{ width: 18, fontSize: 11, color: '#333', fontWeight: 600, textAlign: 'center' }}>{row}</span>
            </div>
          ))}
        </div>

        {/* ── Legend ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, paddingTop: 20, borderTop: '1px solid #111', marginBottom: 120 }}>
          <LegendItem label="Available"><NormalSeat id="" state="available"/></LegendItem>
          <LegendItem label="Selected"><NormalSeat id="" state="selected"/></LegendItem>
          <LegendItem label="Occupied"><NormalSeat id="" state="occupied"/></LegendItem>
          <LegendItem label="Recliner"><ReclinerSeat id="" state="available"/></LegendItem>
          <LegendItem label="Recliner selected"><ReclinerSeat id="" state="selected"/></LegendItem>
        </div>
      </div>

      {/* ── Sticky Footer ── */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', width: '92%', maxWidth: 860, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 28, padding: '20px 28px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, zIndex: 50, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
        <div>
          <p style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 4 }}>
            Selected: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
          </p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            ${totalPrice.toFixed(2)}
          </p>
        </div>
        <button onClick={handleCheckout} disabled={selectedSeats.length === 0}
          style={{ padding: '16px 40px', background: selectedSeats.length > 0 ? '#e50914' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: 18, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedSeats.length === 0 ? 0.25 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
          Pay Now <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  )
}

export default SeatLayout
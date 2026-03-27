import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon, ArrowUpRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Title from '../../components/admin/Title'
import Loading from '../../components/Loading'
import BlurCircle from '../../components/BlurCircle'
import { dateFormat } from '../../lib/dateFormat'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppContext'

const Dashboard = () => {
  const { axios, user } = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY || "$"
  const [dashboardData, setDashboardData] = useState({ totalBookings: 0, totalRevenue: 0, activeShows: [], totalUser: 0 })
  const [loading, setLoading] = useState(true)

  const dashboardCards = [
    { title: "Total Bookings", value: dashboardData.totalBookings, icon: ChartLineIcon, color: "text-blue-400" },
    { title: "Total Revenue", value: `${currency}${dashboardData.totalRevenue}`, icon: CircleDollarSignIcon, color: "text-emerald-400" },
    { title: "Active Shows", value: dashboardData.activeShows.length, icon: PlayCircleIcon, color: "text-primary" },
    { title: "Total Users", value: dashboardData.totalUser, icon: UsersIcon, color: "text-purple-400" },
  ]

  const fetchDashboardData = async () => {
    try {
      // ✅ No need to manually pass token — axios interceptor handles it
      const { data } = await axios.get("/api/admin/dashboard")
      if (data.success) setDashboardData(data.dashboardData)
    } catch (error) {
      toast.error("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) fetchDashboardData() }, [user])

  if (loading) return <Loading />

  return (
    <div className="p-4 md:p-8 text-white min-h-screen">
      <Title text1="Admin" text2="Insights" />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        <BlurCircle top="-100px" left="0px" />
        {dashboardCards.map((card, index) => (
          <div key={index} className="group relative bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/[0.08] transition-all duration-300">
            <div className={`p-3 rounded-xl bg-black/40 w-max mb-4 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h1 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{card.title}</h1>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
            <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-gray-700 group-hover:text-primary transition" />
          </div>
        ))}
      </div>

      {/* Active Shows Section */}
      <div className="mt-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold border-l-4 border-primary pl-4">Live Screenings</h2>
          <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">{dashboardData.activeShows.length} Shows Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {dashboardData.activeShows.map((show) => (
            <div key={show._id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition duration-300">
              <div className="relative aspect-[2/3]">
                {/* ✅ FIX: use show.movie.poster directly — it's now a full URL */}
                <img
                  src={show.movie?.poster}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                  alt={show.movie?.title}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Image' }}
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold">
                  {show.movie?.vote_average?.toFixed(1)} <StarIcon className="w-2 h-2 inline fill-primary text-primary" />
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold truncate text-sm">{show.movie?.title}</p>
                {/* ✅ FIX: use show.date and show.time instead of show.showDateTime */}
                <p className="text-[10px] text-gray-500 mt-1">{show.date} {show.time}</p>
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="text-primary font-bold">{currency}{show.showPrice}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
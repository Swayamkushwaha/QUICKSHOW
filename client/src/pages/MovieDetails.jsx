import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PlayCircle, Star, Heart, Clock, Calendar, Globe, ChevronRight } from 'lucide-react'
import DateSelect from '../components/DateSelect'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MovieDetails = () => {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { axios, getToken, user, fetchFavoriteMovies, favoriteMovies } = useAppContext()

  const fetchShow = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/shows/${id}`)
      if (data.success) setData(data)
    } catch (error) {
      toast.error("Failed to fetch movie details")
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    try {
      if (!user) return toast.error("Please login first")
      const { data: favData } = await axios.post('/api/user/update-favorite',
        { movieId: data.movie._id }
      )
      if (favData.success) {
        await fetchFavoriteMovies()
        toast.success("Favorites updated")
      }
    } catch (error) { toast.error("Action failed") }
  }

  useEffect(() => { fetchShow() }, [id])

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-white">Loading...</div>
  if (!data || !data.movie) return <div className="text-center mt-20 text-white">Movie not found</div>

  const isFavorite = favoriteMovies?.some(m => m._id === data.movie._id)
  const movie = data.movie

  return (
    <div className='min-h-screen bg-[#0a0a0a] text-white pb-20 selection:bg-primary selection:text-white'>

      {/* Hero Backdrop */}
      <div className="absolute top-0 left-0 w-full h-[85vh] overflow-hidden pointer-events-none">
        {/* ✅ FIX: use movie.backdrop instead of movie.backdrop_path */}
        <img src={movie.backdrop} className="w-full h-full object-cover scale-110 blur-sm opacity-30" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent"></div>
      </div>

      <div className='relative px-6 md:px-16 lg:px-40 pt-32 md:pt-48 max-w-[1600px] mx-auto'>
        <div className='flex flex-col lg:flex-row gap-16'>

          {/* Poster */}
          <div className="relative shrink-0 mx-auto lg:mx-0">
            <div className="absolute -inset-2 bg-primary/20 rounded-[2rem] blur-xl opacity-50"></div>
            {/* ✅ FIX: use movie.poster instead of movie.poster_path */}
            <img
              src={movie.poster}
              className='relative rounded-2xl h-[550px] w-[380px] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10'
              alt={movie.title}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/380x550?text=No+Image' }}
            />
          </div>

          {/* Info Section */}
          <div className='flex flex-col gap-8 flex-1'>
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-bold tracking-tighter uppercase flex items-center gap-1.5 text-primary">
                <Globe className="w-3.5 h-3.5" /> {movie.original_language}
              </span>
              <span className="text-gray-400 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {movie.release_date?.split('-')[0]}
              </span>
              <span className="text-gray-400 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {movie.runtime}m
              </span>
            </div>

            <h1 className='text-6xl md:text-7xl font-black tracking-tighter leading-[0.9]'>{movie.title}</h1>

            <div className='flex items-center gap-3'>
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-black text-xl text-yellow-500">{movie.vote_average?.toFixed(1)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((g, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium">{g}</span>
                ))}
              </div>
            </div>

            <p className='text-gray-400 text-lg leading-relaxed max-w-3xl font-medium'>{movie.overview}</p>

            <div className='flex flex-wrap items-center gap-4 mt-4'>
              <button
                onClick={() => window.open(`https://www.youtube.com/results?search_query=${movie.title}+trailer`, '_blank')}
                className='flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 group'
              >
                <PlayCircle className='w-6 h-6 group-hover:fill-white' /> Watch Trailer
              </button>

              <button
                onClick={() => document.getElementById("dateSelect").scrollIntoView({ behavior: "smooth" })}
                className='px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95'
              >
                Book Tickets
              </button>

              <button
                onClick={handleFavorite}
                className={`p-4 rounded-2xl border transition-all duration-300 active:scale-90 ${isFavorite ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-white hover:border-red-500/50'}`}
              >
                <Heart className={`w-7 h-7 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Cast Gallery */}
        <div className='mt-32'>
          <div className="flex items-center gap-4 mb-10">
            <h2 className='text-3xl font-black tracking-tighter uppercase'>The Cast</h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-primary/50 to-transparent"></div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6'>
            {movie.casts && movie.casts.length > 0 ? (
              movie.casts.map((actor, i) => (
                <div key={i} className='group cursor-default'>
                  <div className='relative aspect-square rounded-2xl overflow-hidden mb-3 border border-white/5 group-hover:border-primary/50 transition-colors'>
                    {/* ✅ FIX: profile_path is now a full URL saved in DB */}
                    <img
                      src={actor.profile_path || 'https://via.placeholder.com/185x185?text=No+Photo'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={actor.name}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/185x185?text=No+Photo' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <p className='text-sm font-bold text-gray-200 truncate'>{actor.name}</p>
                  <p className='text-xs text-gray-500 truncate'>{actor.character}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Cast information unavailable.</p>
            )}
          </div>
        </div>

        <div id="dateSelect" className="mt-32 pt-20 border-t border-white/5">
          <DateSelect dateTime={data.dateTime} id={id} />
        </div>
      </div>
    </div>
  )
}

export default MovieDetails
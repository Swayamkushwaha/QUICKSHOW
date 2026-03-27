import React from 'react'
import { Star, Clock, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MovieCard = ({ movie }) => {
  const navigate = useNavigate()
  const { axios, getToken, user, fetchFavoriteMovies, favoriteMovies } = useAppContext()

  // Check if this specific movie is already in the user's favorites
  const isFavorite = favoriteMovies?.some(m => m._id === movie._id)

  const handleFavorite = async (e) => {
    // Prevent the click from triggering the navigate to MovieDetails
    e.stopPropagation() 
    
    try {
      if (!user) return toast.error("Please login to favorite movies")

      const { data } = await axios.post(
        '/api/user/update-favorite',
        { movieId: movie._id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )

      if (data.success) {
        await fetchFavoriteMovies()
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
      }
    } catch (error) {
      toast.error("Failed to update favorites")
    }
  }

  const imageUrl = movie?.poster_path 
    ? (movie.poster_path.startsWith('http') 
        ? movie.poster_path 
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : 'https://via.placeholder.com/500x750?text=No+Image';

  return (
    <div 
      onClick={() => navigate(`/movie/${movie._id}`)}
      className="group relative bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all w-64 shadow-lg hover:shadow-primary/5"
    >
      {/* 🖼️ Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={movie?.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* ❤️ Favorite Icon Overlay */}
        <button 
          onClick={handleFavorite}
          className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 z-10 
            ${isFavorite 
              ? 'bg-red-500/20 border-red-500/40 text-red-500' 
              : 'bg-black/40 border-white/10 text-white hover:bg-white/20'
            }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
        </button>

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* 📝 Movie Info */}
      <div className="p-4 relative">
        <h3 className="font-bold text-sm truncate text-white mb-2 tracking-tight group-hover:text-primary transition-colors">
            {movie?.title || "Untitled"}
        </h3>
        
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                {movie?.release_date?.split('-')[0] || "2026"}
            </span>
            <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" /> {movie?.runtime || "0"}m
            </span>
          </div>
          
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/10 text-yellow-500">
            <Star className="w-3 h-3 fill-yellow-500" />
            <span className="font-bold">{movie?.vote_average?.toFixed(1) || "0.0"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
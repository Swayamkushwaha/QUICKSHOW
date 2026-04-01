import { ArrowRight } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle'
import MovieCard from './MovieCard'
import { useAppContext } from '../context/AppContext'

const FeaturedSection = () => {
  const navigate = useNavigate()
  const { shows } = useAppContext()

  // ✅ FIXED: Logic to extract unique movies from the shows array
  // This prevents the same movie appearing 4 times if it has multiple showtimes
  const uniqueMovies = shows && shows.length > 0 
    ? Array.from(new Set(shows.map(s => s.movie?._id)))
        .map(id => shows.find(s => s.movie?._id === id))
        .filter(item => item && item.movie) // Ensure movie object exists
    : [];

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
      <div className='relative flex items-center justify-between pt-20 pb-10'>
        <BlurCircle top='0' right='-80px'/>
        <p className='text-gray-300 font-medium text-lg'>Now Showing</p>

        <button
          onClick={() => navigate('/movies')}
          className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'
        >
          View All
          <ArrowRight className='w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform' />
        </button>
      </div>

      <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
        {uniqueMovies.length > 0 ? (
          // Show only the first 4 unique movies
          uniqueMovies.slice(0, 4).map((show) => (
            <MovieCard key={show._id} movie={show.movie} />
          ))
        ) : (
          <div className="w-full py-10 text-center border border-dashed border-white/10 rounded-xl">
             <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">No movies currently scheduled</p>
          </div>
        )}
      </div>

      <div className='flex justify-center mt-20'>
        <button
          onClick={() => navigate('/movies')}
          className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'
        >
          Show more
        </button>
      </div>
    </div>
  )
}

export default FeaturedSection
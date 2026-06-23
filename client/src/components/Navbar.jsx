import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon, Heart, LayoutDashboard, Home, Film, Theater, Rocket } from 'lucide-react'
import { useState } from 'react'
import { useUser, useClerk, UserButton } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()
  const { favoriteMovies, isAdmin } = useAppContext() // ✅ Destructured isAdmin

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Movies', path: '/movies', icon: <Film className="w-4 h-4" /> },
    { name: 'Theaters', path: '/', icon: <Theater className="w-4 h-4" /> },
    { name: 'Releases', path: '/', icon: <Rocket className="w-4 h-4" /> },
  ]

  return (
    <nav className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 backdrop-blur-xl bg-black/60 border-b border-white/5'>
      
      {/* 🚀 LOGO */}
      <Link to='/' className='max-md:flex-1 transition-transform hover:scale-105'>
        <img src={assets.logo} alt="QuickShow Logo" className='w-36 h-auto' />
      </Link>

      {/* 📱 NAVIGATION LINKS */}
      <div className={`max-md:absolute max-md:top-0 max-md:left-0 z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 py-3 max-md:h-screen md:px-8 md:rounded-full backdrop-blur-2xl bg-black/90 md:bg-white/5 md:border border-white/10 transition-all duration-500 ${isOpen ? 'max-md:w-full opacity-100' : 'max-md:w-0 opacity-0 md:opacity-100 overflow-hidden'}`}>
        
        <XIcon className='absolute top-8 right-8 w-8 h-8 cursor-pointer md:hidden text-gray-400 hover:text-white' onClick={() => setIsOpen(false)} />

        {navLinks.map((link) => (
          <Link 
            key={link.name}
            onClick={() => { window.scrollTo(0, 0); setIsOpen(false) }} 
            to={link.path}
            className="text-sm font-medium text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
          >
            {link.name}
          </Link>
        ))}

        {favoriteMovies.length > 0 && (
          <Link 
            onClick={() => { window.scrollTo(0, 0); setIsOpen(false) }} 
            to='/favorite'
            className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2"
          >
            <Heart className="w-4 h-4" /> Favorites
          </Link>
        )}
      </div>

      {/* 👤 ACTIONS & PROFILE */}
      <div className='flex items-center gap-6'>
        <SearchIcon className='max-md:hidden w-5 h-5 text-gray-400 cursor-pointer hover:text-primary transition-all hover:scale-110' />

        {!user ? (
          <button
            onClick={openSignIn}
            className='px-7 py-2 bg-primary hover:bg-primary/80 text-white transition-all rounded-full font-bold text-sm shadow-lg shadow-primary/20'
          >
            Login
          </button>
        ) : (
          <div className='flex items-center gap-4'>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className='px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white transition-all rounded-full font-bold text-xs md:text-sm shadow-lg shadow-green-600/20'
              >
                Admin Panel
              </button>
            )}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 border-2 border-primary/20 hover:border-primary/50 transition-all",
                }
              }}
            >
              <UserButton.MenuItems>
                {/* ✅ FIXED: Removed .Label and standard divs. Using .Action only */}
                
                <UserButton.Action
                  label="My Bookings"
                  labelIcon={<TicketPlus size={16} className="text-primary" />}
                  onClick={() => navigate('/my-bookings')}
                />

                <UserButton.Action
                  label="Favorite Movies"
                  labelIcon={<Heart size={16} className="text-red-500" />}
                  onClick={() => navigate('/favorite')}
                />

                {/* ✅ ONLY shows if isAdmin state is true */}
                {isAdmin && (
                  <UserButton.Action
                    label="Admin Panel"
                    labelIcon={<LayoutDashboard size={16} className="text-green-500" />}
                    onClick={() => navigate('/admin')}
                  />
                )}
              </UserButton.MenuItems>
            </UserButton>
          </div>
        )}

        <MenuIcon
          className='ml-4 w-7 h-7 cursor-pointer md:hidden text-white'
          onClick={() => setIsOpen(true)}
        />
      </div>
    </nav>
  )
}

export default Navbar
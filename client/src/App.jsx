import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import { Toaster } from 'react-hot-toast'
import SeatLayout from './pages/SeatLayout'
import Loading from './components/Loading' // ✅ Added import

import Layout from "./pages/admin/Layout";
import DashBoard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";
import { useAppContext } from './context/AppContext'
import { SignIn } from '@clerk/clerk-react'

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  const { user } = useAppContext()

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movie/:id' element={<MovieDetails />} />
        <Route path='/movie/:id/:date' element={<MovieDetails />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        
        {/* ✅ Success Redirect Route */}
        <Route path='/loading/my-bookings' element={<Loading />} />
        
        <Route path='/favorite' element={<Favorite />} />
        <Route path="/seat-layout/:id/:date" element={<SeatLayout />} />

        <Route path='/admin/*' element={user ? <Layout /> : (
          <div className='min-h-screen flex justify-center items-center'>
            <SignIn fallbackRedirectUrl={'/admin'}/>
          </div>
        )}>
          <Route index element={<DashBoard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
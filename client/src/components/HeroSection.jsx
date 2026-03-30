import React from 'react';
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. IMPORT YOUR IMAGE (This is the key fix for Vercel/Vite)
// Ensure the path to your assets folder is correct relative to this file
import backgroundImage from '../assets/backgroundImage.png';

// 2. ASSUMED LOGO IMPORT (Adjust the path to match your assets file)
// import { assets } from '../assets/assets';

const HeroSection = () => {
    const navigate = useNavigate();

    // If you don't have an assets file yet, you can replace 'assets.marvelLogo' 
    // with a direct import or a string URL.
    const marvelLogo = "https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg"; 

    return (
        <div 
            className='relative flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 h-screen bg-cover bg-center text-white'
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            {/* Overlay to make text more readable if the image is bright */}
            <div className="absolute inset-0 bg-black/40 -z-10"></div>

            {/* Marvel Logo */}
            <img 
                src={marvelLogo} 
                alt="Marvel Logo" 
                className="max-h-11 lg:h-11 mt-20 object-contain" 
            />

            {/* Main Title */}
            <h1 className='text-5xl md:text-7xl lg:text-[70px] leading-tight md:leading-[1.1] font-bold max-w-2xl'>
                Guardians <br /> of the Galaxy
            </h1>

            {/* Metadata Section */}
            <div className='flex flex-wrap items-center gap-4 text-gray-300 font-medium'>
                <span>Action | Adventure | Sci-Fi</span>
                
                <div className='flex items-center gap-1 border-l border-gray-500 pl-4'>
                    <CalendarIcon className='w-4 h-4' /> 
                    <span>2018</span>
                </div>

                <div className='flex items-center gap-1 border-l border-gray-500 pl-4'>
                    <ClockIcon className='w-4 h-4' /> 
                    <span>2h 8m</span>
                </div>
            </div>

            {/* Description */}
            <p className='max-w-md text-gray-300 text-lg leading-relaxed'>
                A group of intergalactic criminals must pull together to stop a fanatical warrior with 
                plans to purge the universe.
            </p>

            {/* CTA Button */}
            <button 
                onClick={() => navigate('/movies')} 
                className='mt-4 flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white transition-all rounded-full font-bold cursor-pointer group'
            >
                Explore Movies
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
            </button>
        </div>
    );
};

export default HeroSection;
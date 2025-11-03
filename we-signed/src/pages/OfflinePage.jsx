import React from 'react';
import { Link } from 'react-router-dom';

const OfflinePage = () => {

    return (
        <div className='flex flex-col items-center justify-center h-screen bg-[#f8f8f8] text-[#333]'>
            <h1 className='font-bold text-xl sm:text-2xl md:text-3xl'>You are offline</h1>
            <p className='p-2 text-lg sm:text-xl md:text-2xl lg:3xl text-center'>Please check your internet connection and try again.</p>
            <img src='/images/offline.png' alt='Offline image' className='h-40 sm:h-56 object-contain'/>
            <Link to="/offline-header/offline-login"
                className='py-2.5 px-5 m-2 bg-gradient-to-r from-indigo-500 to-sky-300 hover:from-indigo-600 hover:to-sky-400 text-[#fff] rounded-lg text-[-16px] hover:font-bold sm:text-xl md:text-2xl lg:3xl hover:scale-105 cursor-pointer transition'>
                Continue offline
            </Link> 
        </div>
    );
}
export default OfflinePage;
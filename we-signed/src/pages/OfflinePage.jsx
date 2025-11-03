import React from 'react';
import { Link } from 'react-router-dom';

const OfflinePage = () => {

    return (
        <div className='flex flex-col items-center justify-center h-screen bg-[#f8f8f8] text-[#333]'>
            <h1 className='font-bold text-lg sm:text-xl md:text-2xl'>You are offline</h1>
            <p className='p-2 text-lg sm:text-xl md:text-2xl lg:3xl'>Please check your internet connection and try again.</p>
            <img src='/images/offline.png' alt='Offline image' className='h-40 sm:h-56 object-contain'/>
            <Link to="/offline-header/offline-login"
                className='py-2.5 px-5 m-2 bg-[#007bff] text-[#fff] rounded-lg text-lg sm:text-xl md:text-2xl lg:3xl hover:bg-blue-600'>
                Continue offline.
            </Link>
        </div>
    );
}
export default OfflinePage;
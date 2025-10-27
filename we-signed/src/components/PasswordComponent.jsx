import {useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';

export default function PasswordInput({placeholder = 'Enter password', ...props}){
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className='relative w-full'>
            <input type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                className='w-full px-3 sm:px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-indigo-50 text-indigo-900 text-base sm:text-lg' {...props} />
            <button type='button'
                className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword?<EyeOff size={20}/>:<Eye size={20}/>}
            </button>
        </div>
    );
}
import {useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';

export default function PasswordInput({placeholder = 'Enter password', ...props}){
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className='relative w-fuull max-w-sm'>
            <input type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                className='w-full rounded-xl border border-gray-300 p-2 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-indigo-50' {...props} />
            <button type='button'
                className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword?<EyeOff size={20}/>:<Eye size={20}/>}
            </button>
        </div>
    );
}
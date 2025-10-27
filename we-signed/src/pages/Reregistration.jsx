import { useEffect } from "react";
import { useAlert } from "../components/AlertContext";
import { useNavigate } from "react-router-dom";

export default function Reregistration() {
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        showAlert("Please know that it will take 12hours for the new account to be activated. This is to prevent impersonation.", "info", { closable: true });
    }, []);

    return (
        <div className='flex justify-center items-center min-h-screen flex-col gap-6'>
            <h1 className='text-indigo-700 text-2xl'>COMING SOON...</h1>
            <button onClick={() => navigate('/')} className='cursor-pointer'>Back</button>
        </div>
    );
}
import {useNavigate} from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600">404</h1>
                <p className="mt-4 text-lg text-gray-700">Page Not Found</p>
            <p className="mt-2 text-gray-500">The page you are looking for does not exist.</p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" 
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
}
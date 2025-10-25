import {useNavigate} from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-2 sm:px-4 py-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4 sm:p-8 flex flex-col items-center text-center">
                <h1 className="text-3xl sm:text-5xl font-bold text-red-600">404</h1>
                <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-700">Page Not Found</p>
                <p className="mt-1 sm:mt-2 text-gray-500 text-sm sm:text-base">The page you are looking for does not exist.</p>

                {/* Image placeholder */}
                <div className="my-8 w-full flex justify-center">
                    <img src="/images/monster.png" alt="Not Found" className="h-40 sm:h-56 object-contain" />
                </div>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-2 sm:mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}
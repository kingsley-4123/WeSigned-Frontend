import axios from 'axios';

//'http://10.154.178.217:5000/api' 'http://localhost:5000/api' || ;

const API_BASE_URL = '/api';

const service = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `x-auth-token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
service.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const login = (email) => service.post('/login', { email }, { withCredentials: true });

export const verifyLogin = (loginResponse) => service.post('/login/webauthn/authenticate/verify', { loginResponse }, { withCredentials: true });

export const signup = (user) => service.post('/signup', { user }, { withCredentials: true });

export const verifySignup = (registrationResponse) => service.post('/signup/webauthn/register/verify', { registrationResponse }, { withCredentials: true });

export const createAttendanceSession = payload => service.post('/attendance-sessions', { payload}, { withCredentials: true })

export const getAttendanceSession = specialId => service.get(`/attendance-sessions/${specialId}`, { withCredentials: true });

export const signAttendance = (specialId, studentData) => service.post(`/attendance-sessions/${specialId}/sign`, { ...studentData }, { withCredentials: true });

export const getAttendances = (specialId) => service.get(`/attendance/${specialId}`, { withCredentials: true }); 

export const sendOTP = (email) => service.post('/otp/send', { email }, { withCredentials: true });

export const verIfyOTP = (otp) => service.post('/otp/verify', { otp }, { withCredentials: true });

export const reRegister = (email) => service.post('/re-register', { email }, { withCredentials: true });

export const attendanceExport = (type, specialId ) => service.get(`/attendance.${type}/${specialId}`, { responseType: "blob" });

export const exportOfflineAttendance = (type, specialId, attendanceName) => service.get(`/attendance.${type}/${specialId}/${attendanceName}`, { responseType: "blob" });

export const getSyncedAttendance = (specialId, attendanceName) => service.get(`/sync/${specialId}/${attendanceName}`, { withCredentials: true });

export const initiatePayment = (payload) => service.post('/payment/payment-intent', { ...payload }, { withCredentials: true });

export const checkOnline = () => service.get('/isOnline', { withCredentials: true });

export const getSubTimestamp = () => service.get('/subscription', { withCredentials: true });

export const getUserProfile = () => {
    return service.get('/auth/profile')
        .then(response => response.data)
        .catch(error => {
            throw error.response ? error.response.data : error;
        });
}
export const updateUserProfile = (firstname, middlename, surname, email) => {
    return service.put('/auth/profile', { firstname, middlename, surname, email })
        .then(response => response.data)
        .catch(error => {
            throw error.response ? error.response.data : error;
        });
}
export const logout = () => {
    return service.post('/auth/logout')
        .then(response => {
            localStorage.removeItem('token');
            return response.data;
        })
        .catch(error => {
            throw error.response ? error.response.data : error;
        });
}
export default service;

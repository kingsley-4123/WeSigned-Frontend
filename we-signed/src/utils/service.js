import axios from 'axios';

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
}); 

service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('INTERCEPTOR', token);
        if (token) {
            config.headers['x-auth-token'] = token;
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
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message;

            if(status === 400 && message === 'Invalid token.'){
                console.warn(message);
                localStorage.removeItem('token');
                window.location.href = '/auth';
            } else if(status === 401){
                console.warn(message);
                localStorage.removeItem('token');
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export const login = (payload) => service.post('/login', { ...payload }, { withCredentials: true });

export const verifyLogin = (loginResponse) => service.post('/login/webauthn/authenticate/verify', { loginResponse }, { withCredentials: true });

export const signup = (user) => service.post('/signup', { user }, { withCredentials: true });

export const verifySignup = (registrationResponse) => service.post('/signup/webauthn/register/verify', { registrationResponse }, { withCredentials: true });

export const createAttendanceSession = (payload) => service.post('/attendance-session', { payload }, { withCredentials: true })

export const getAttendanceSession = specialId => service.get(`/attendance-session/${specialId}`, { withCredentials: true });

export const signAttendance = (specialId, studentData) => service.post(`/attendance/${specialId}/sign`, { ...studentData }, { withCredentials: true });

export const getAttendances = (specialId) => service.get(`/attendance/${specialId}`, { withCredentials: true }); 

export const sendOTP = (email) => service.post('/otp/send', { email }, { withCredentials: true });

export const verIfyOTP = (otp) => service.post('/otp/verify', { otp }, { withCredentials: true });

export const updatePassword = (email, newPassword) => service.post('/otp/update-password', { email, newPassword }, { withCredentials: true });

export const reRegister = (payload) => service.post('/re-register', { ...payload }, { withCredentials: true });

export const attendanceExport = (type, specialId) => service.get(`/attendance.${type}/${specialId}`, { responseType: 'blob' });

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

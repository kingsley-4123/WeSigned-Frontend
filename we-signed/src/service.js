import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
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

export const login = (email, password) => service.post('/login', { email, password }, { withCredentials: true });

export const verifyLogin = (loginResponse) => service.post('/webauthn/authenticate/verify', { loginResponse }, { withCredentials: true });

export const signup = (user) => service.post('/signup', { user }, { withCredentials: true });

export const verifySignup = (registrationResponse) => service.post('/webauthn/register/verify', { registrationResponse }, { withCredentials: true });

export const createAttendanceSession = payload => service.post('/attendance-sessions', { payload}, { withCredentials: true })

export const getAttendanceSession = specialId => service.get(`/attendance-sessions/${specialId}`, { withCredentials: true });

export const signAttendance = (specialId, studentData) => service.post(`/attendance-sessions/${specialId}/sign`, { ...studentData }, { withCredentials: true });

export const getAttendances = (specialId, lecturerId) => service.get(`attendance/${specialId}/${lecturerId}`, { withCredentials: true }); 

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

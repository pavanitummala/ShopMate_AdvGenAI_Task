import axios from 'axios';

//create a configured axios instance with auth headers and 401 interceptor
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type':'application/json'
    }
});

//Attach token to every request

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//on 401 response,try to refresh token.If it fails,clear session and redirect to login
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;


        //If 401 and we haven't already tried to refresh 

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const res = await axios.post('http://localhost:3001/api/users/refresh',
                        { refreshToken });
                    if (res.status === 200) {
                        localStorage.setItem('accessToken', res.data.accessToken);
                        localStorage.setItem('refreshToken', res.data.refreshToken);

                        //update the auth header for the failed request
                        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                        return api(originalRequest);
                    }
                    
                }
            } catch (refreshError){
                //refresh failed
                //If refresh fails or there's no refresh token
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    }
);
export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
};
export default api;
        

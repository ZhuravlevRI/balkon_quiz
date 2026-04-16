import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
axios.defaults.baseURL = API_BASE_URL
axios.defaults.withCredentials = true

// HELPER

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

// API REQUESTS

export async function getMe({ queryKey }) {
    // const [_key, { userId }] = queryKey
    const response = await axios.get(`/users/me`)
    return response.data
}

export async function postLogin(data) {
    const response = await axios.post('/users/login', data)
    return response.data
}

export async function postRegister(data) {
    const response = await axios.post('/users/singin', data)
    return response.data
}

export async function postLogout(data) {
    const response = await axios.post('/users/logout')
    return response.data
}

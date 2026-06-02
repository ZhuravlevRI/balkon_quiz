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
    const response = await axios.get(`/users/me`)
    return response.data
}

export async function getQuizList({ queryKey, pageParam }) {
    const response = await axios.get(`/quiz/list`, {
        params: {
            page: pageParam
        }
    })
    return response.data
}

export async function getQuiz({ queryKey }) {
    const [_key, { quizId }] = queryKey
    const response = await axios.get(`/quiz/${quizId}`)
    return response.data
}

export function getImage(id) {
    return `${API_BASE_URL}/images/${id}`
}

export async function postLogin(data) {
    const response = await axios.post('/users/login', data)
    return response.data
}

export async function postRegister(data) {
    const response = await axios.post('/users/singin', data)
    return response.data
}

export async function postLogout() {
    const response = await axios.post('/users/logout')
    return response.data
}

export async function postQuizCreate() {
    const response = await axios.post('/quiz/create')
    return response.data
}

export async function putQuiz(quizId, data) {
    const response = await axios.put(`/quiz/${quizId}`, data)
    return response.data
}

export async function deleteQuiz(quizId) {
    const response = await axios.delete(`/quiz/${quizId}`)
    return response.data
}

// session

export async function getSessionStatus({ queryKey }) {
    const response = await axios.get(`/session/status`)
    return response.data
}

export async function getSessionPlayerList({ queryKey }) {
    const response = await axios.get(`/session/player/list`)
    return response.data
}

export async function postCreateSession() {
    const response = await axios.post(`/session/create`)
    return response.data
}

export async function deleteSession() {
    const response = await axios.delete(`/session/`)
    return response.data
}

export async function postSessionQuiz(quiz) {
    const response = await axios.post(`/session/quiz`, null, {
        params: {
            quiz_id: quiz,
        }
    })
    return response.data
}

export async function postSessionPlayerKick(player) {
    const response = await axios.post(`/session/player/${player}/kick`)
    return response.data
}

export async function postJoinSession(code, username) {
    const response = await axios.post(`/session/join`, null, {
        params: {
            session_code: code,
            username: username
        }
    })
    return response.data
}

export async function postSessionProgress() {
    const response = await axios.post(`/session/progress`)
    return response.data
}

export async function postUpload(files) {
    let data = new FormData()
    data.append('file', files[0])

    const response = await axios.post(`/images/upload`, data)
    return response.data
}

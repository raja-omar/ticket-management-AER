import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getTickets = () => api.get('/tickets').then(res => res.data);
export const getTicket = (id) => api.get(`/tickets/${id}`).then(res => res.data);
export const createTicket = (data) => api.post('/tickets', data).then(res => res.data);
export const updateTicket = (id, data) => api.patch(`/tickets/${id}`, data).then(res => res.data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);

export const getComments = (ticketId) => api.get(`/tickets/${ticketId}/comments`).then(res => res.data);
export const createComment = (ticketId, data) => api.post(`/tickets/${ticketId}/comments`, data).then(res => res.data);
export const deleteComment = (ticketId, commentId) => api.delete(`/tickets/${ticketId}/comments/${commentId}`);

export const getActivities = (ticketId) => api.get(`/tickets/${ticketId}/activities`).then(res => res.data);

export default api;

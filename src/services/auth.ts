import { Customer, CustomerAddress } from '@/services/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL 

const jsonHeaders = (token?: string) => ({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
})

const authHeaders = (token: string) => ({
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
})

/* ── Auth ─────────────────────────────── */
export const authService = {

    register: async (data: {
        name: string
        email: string
        phone: string
        password: string
        password_confirmation: string
    }): Promise<{ access_token: string; customer: Customer }> => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json
    },

    login: async (login: string, password: string): Promise<{ access_token: string; customer: Customer }> => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify({ login, password }),
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json
    },

    me: async (token: string): Promise<Customer> => {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: authHeaders(token),
        })
        if (!res.ok) throw new Error('Unauthorized')
        const json = await res.json()
        return json.customer ?? json.data ?? json
    },

    logout: async (token: string): Promise<void> => {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: authHeaders(token),
        })
    },

    /* ── Profile ────────────────────────── */
    updateProfile: async (token: string, data: { name?: string; email?: string; phone?: string }): Promise<Customer> => {
        const res = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: jsonHeaders(token),
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json.customer ?? json.data ?? json
    },

    uploadAvatar: async (token: string, file: File): Promise<{ avatar_url: string }> => {
        const formData = new FormData()
        formData.append('avatar', file)
        const res = await fetch(`${API_URL}/profile/avatar`, {
            method: 'POST',
            headers: authHeaders(token),
            body: formData,
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json
    },

    deleteAvatar: async (token: string): Promise<void> => {
        await fetch(`${API_URL}/profile/avatar`, {
            method: 'DELETE',
            headers: authHeaders(token),
        })
    },

    changePassword: async (token: string, data: {
        current_password: string
        new_password: string
        new_password_confirmation: string
    }): Promise<void> => {
        const res = await fetch(`${API_URL}/profile/change-password`, {
            method: 'POST',
            headers: jsonHeaders(token),
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (!res.ok) throw json
    },

    /* ── Addresses ──────────────────────── */
    getAddresses: async (token: string): Promise<CustomerAddress[]> => {
        const res = await fetch(`${API_URL}/addresses`, {
            headers: authHeaders(token),
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json.data ?? json
    },

    createAddress: async (token: string, data: Omit<CustomerAddress, 'id' | 'created_at'>): Promise<CustomerAddress> => {
        const res = await fetch(`${API_URL}/addresses`, {
            method: 'POST',
            headers: jsonHeaders(token),
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json.data ?? json
    },

    updateAddress: async (token: string, id: string, data: Partial<Omit<CustomerAddress, 'id' | 'created_at'>>): Promise<CustomerAddress> => {
        const res = await fetch(`${API_URL}/addresses/${id}`, {
            method: 'PUT',
            headers: jsonHeaders(token),
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json.data ?? json
    },

    setDefaultAddress: async (token: string, id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/addresses/${id}/default`, {
            method: 'PATCH',
            headers: authHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to set default address')
    },

    deleteAddress: async (token: string, id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/addresses/${id}`, {
            method: 'DELETE',
            headers: authHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to delete address')
    },
}
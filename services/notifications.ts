import api from "./api"

export interface Notification {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export const notificationsService = {
  // Get all notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get("/api/notifications/")
    return response.data
  },

  // Get unread notifications
  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await api.get("/api/notifications/unread/")
    return response.data
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/api/notifications/count_unread/")
    return response.data.count
  },

  // Mark a notification as read
  markAsRead: async (id: number): Promise<void> => {
    await api.post(`/api/notifications/${id}/mark_as_read/`)
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.post("/api/notifications/mark_all_as_read/")
  },
}


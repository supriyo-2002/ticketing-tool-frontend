
import { useCallback, useEffect, useState } from "react";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notificationService";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch notifications and unread count
  const fetchNotifications = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const [notificationResult, unreadResult] = await Promise.all([
        getNotifications(1, 20),
        getUnreadCount(),
      ]);

      setNotifications(notificationResult.data || []);
      setUnreadCount(unreadResult || 0);

    } catch (err) {
      console.error("Fetch Notifications Error:", err);
      setError(err.message || "Unable to load notifications.");

    } finally {
      setLoading(false);
    }
  }, []);

  // Initial API call
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark one notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));

    } catch (err) {
      console.error("Mark As Read Error:", err);
      throw err;
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);

    } catch (err) {
      console.error("Mark All As Read Error:", err);
      throw err;
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification.notification_id !== notificationId
        )
      );

      const deletedNotification = notifications.find(
        (notification) =>
          notification.notification_id === notificationId
      );

      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount((previous) => Math.max(0, previous - 1));
      }

    } catch (err) {
      console.error("Delete Notification Error:", err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
  };
}

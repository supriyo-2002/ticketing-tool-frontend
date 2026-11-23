import React, { useState } from "react";
export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}) {
  const [actionLoading, setActionLoading] = React.useState("");

  const formatDate = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) return "";

    return notificationDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMarkAsRead = async () => {
    try {
      setActionLoading("read");
      await onMarkAsRead(notification.notification_id);
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading("delete");
      await onDelete(notification.notification_id);
    } catch (error) {
      console.error("Unable to delete notification:", error);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div
      className={`group flex gap-3 px-4 py-4 transition hover:bg-[#111c32] ${
        !notification.is_read ? "bg-[#111c32]/70" : ""
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b2943] text-lg">
        {notification.type === "TICKET_ASSIGNED"
          ? "🎫"
          : notification.type === "TICKET_STATUS_CHANGED"
          ? "🔔"
          : "📢"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white">
            {notification.title}
          </p>

          {!notification.is_read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
          )}
        </div>

        <p className="mt-1 text-sm leading-5 text-slate-400">
          {notification.message}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          {formatDate(notification.created_at)}
        </p>

        <div className="mt-3 flex items-center gap-4">
          {!notification.is_read && (
            <button
              type="button"
              onClick={handleMarkAsRead}
              disabled={Boolean(actionLoading)}
              className="text-xs font-medium text-blue-400 transition hover:text-blue-300 disabled:opacity-50"
            >
              {actionLoading === "read" ? "Marking..." : "Mark as read"}
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={Boolean(actionLoading)}
            className="text-xs font-medium text-red-400 transition hover:text-red-300 disabled:opacity-50"
          >
            {actionLoading === "delete" ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

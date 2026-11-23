
import { useState } from "react";
import NotificationItem from "./NotificationItem";
import NotificationsTab from "./NotificationsTab";
import NotificationEmpty from "./NotificationEmpty";

export default function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
  error,
  onRefresh,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((item) => !item.is_read)
      : notifications;

  const handleMarkAll = async () => {
    try {
      await onMarkAllAsRead();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // <div className="absolute right-0 top-14 z-50 w-[calc(100vw-2rem)] max-w-[400px] overflow-hidden rounded-2xl border border-[#26324b] bg-[#0c1427] shadow-2xl shadow-black/40">
      <div className="absolute right-0 top-14 z-50 w-[600px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#26324b] bg-[#0c1427] shadow-2xl shadow-black/40"
      >

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#26324b] px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            Notifications
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {unreadCount} unread notifications
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-[#1b2943] hover:text-white"
          aria-label="Close notifications"
        >
          ✕
        </button>
      </div>

      {/* Tabs and actions */}
      <div className="flex items-center justify-between border-b border-[#26324b] px-4 py-3">
        <NotificationsTab
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <button
          type="button"
          disabled={unreadCount === 0}
          onClick={handleMarkAll}
          className="text-xs font-medium text-blue-400 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      {/* Notification List */}
      {/* <div className="max-h-[400px] overflow-y-auto"> */}
      <div className="max-h-[320px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse space-y-2"
              >
                <div className="h-4 w-2/3 rounded bg-[#26324b]" />
                <div className="h-3 w-full rounded bg-[#1b2943]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300"
            >
              Try again
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <NotificationEmpty activeTab={activeTab} />
        ) : (
          <div className="divide-y divide-[#202943]">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.notification_id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#26324b] px-4 py-3 text-center">
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs font-medium text-blue-400 hover:text-blue-300"
        >
          Refresh notifications
        </button>
      </div>
    </div>
  );
}

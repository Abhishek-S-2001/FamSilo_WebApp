'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import api from '@/lib/axios';

// Match this to the Python schema we just built
interface Notification {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  actor_name?: string;
  silo_name?: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch data on load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/');
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // 2. Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Mark a single notification as read
  const markAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return; // Don't re-ping the server if already read
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark read:", error);
    }
  };

  // 4. Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };

  // Helper to generate text based on notification type
  const getNotificationText = (n: Notification) => {
    const actor = n.actor_name || "Someone";
    const silo = n.silo_name ? ` in ${n.silo_name}` : "";
    
    switch (n.type) {
      case 'like': return <span><strong>{actor}</strong> liked your post{silo}.</span>;
      case 'comment': return <span><strong>{actor}</strong> commented on your post{silo}.</span>;
      case 'join_request': return <span><strong>{actor}</strong> wants to join{silo}.</span>;
      case 'new_post': return <span><strong>{actor}</strong> added a new memory{silo}.</span>;
      default: return <span>You have a new notification from {actor}.</span>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="text-gray-600" size={24} />
        {/* The Red Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-medium text-[#0434c6] hover:text-blue-800 flex items-center gap-1">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                You're all caught up!
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => markAsRead(n.id, n.is_read)}
                  className={`flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors ${
                    n.is_read ? 'bg-white hover:bg-gray-50 text-gray-500' : 'bg-blue-50/40 hover:bg-blue-50/60 text-gray-800'
                  }`}
                >
                  <div className="flex-1 text-sm">
                    {getNotificationText(n)}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {!n.is_read && <div className="h-2 w-2 rounded-full bg-[#0434c6] mt-1.5 flex-shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
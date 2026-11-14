import { useState } from 'react';
import { Bell, Check, Mail, MessageSquare, Heart, Share2, AlertTriangle } from 'lucide-react';

type Notification = {
  id: number;
  type: 'like' | 'comment' | 'reply' | 'mention' | 'follow' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  postId?: number;
};

const mockNotifications: Notification[] = [
  { id: 1, type: 'like', title: 'New Like', message: 'Sarah liked your post "Building community..."', time: '2m ago', read: false, postId: 1 },
  { id: 2, type: 'comment', title: 'New Comment', message: 'John commented on your post', time: '15m ago', read: false, postId: 2 },
  { id: 3, type: 'reply', title: 'New Reply', message: 'Emily replied to your comment', time: '1h ago', read: true, postId: 3 },
  { id: 4, type: 'mention', title: 'Mention', message: 'Mike mentioned you in a comment', time: '3h ago', read: false, postId: 4 },
  { id: 5, type: 'follow', title: 'New Follower', message: 'Lisa started following you', time: '5h ago', read: true },
  { id: 6, type: 'system', title: 'Welcome!', message: 'Welcome to Kommunity!', time: '1d ago', read: true },
];

const getTypeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like': return <Heart size={16} className="text-pink-500" />;
    case 'comment': return <MessageSquare size={16} className="text-blue-500" />;
    case 'reply': return <Mail size={16} className="text-green-500" />;
    case 'mention': return <AlertTriangle size={16} className="text-orange-500" />;
    case 'follow': return <Share2 size={16} className="text-purple-500" />;
    default: return <Bell size={16} className="text-gray-500" />;
  }
};

export function NotificationsPage({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="page-container">
      <div className="notifications-page">
        <div className="page-header">
          <h1>Notifications</h1>
          <button className="outline-button" onClick={onClose}>Close</button>
        </div>

        <div className="notifications-toolbar">
          <div className="filter-group">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All <span className="filter-count">{notifications.length}</span>
            </button>
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread <span className="filter-count">{unreadCount}</span>
            </button>
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-read" onClick={markAllRead}>
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell size={48} />
              <h3>No notifications</h3>
              <p>{filter === 'unread' ? "You're all caught up!" : "You'll see notifications here when they arrive."}</p>
            </div>
          ) : (
            filteredNotifications.map(n => (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? 'unread' : ''}`}
                onClick={() => { if (!n.read) markRead(n.id); }}
              >
                <div className="notification-icon">{getTypeIcon(n.type)}</div>
                <div className="notification-content">
                  <div className="notification-header">
                    <strong>{n.title}</strong>
                    <span className="notification-time">{n.time}</span>
                  </div>
                  <p>{n.message}</p>
                </div>
                {!n.read && <div className="notification-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
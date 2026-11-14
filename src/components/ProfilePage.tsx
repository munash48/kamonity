import { Mail, Calendar, Crown } from 'lucide-react';

export function ProfilePage({ user }: { user: { name: string; email: string; avatarUrl?: string; avatarColor?: string; role?: string; joinedAt?: string } }) {
  const getInitials = (name: string) => name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="page-container">
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="profile-avatar-large" />
            ) : (
              <span className={`profile-avatar-initials-large ${user.avatarColor || getAvatarColor(user.name)}`}>
                {getInitials(user.name)}
              </span>
            )}
          </div>
          <div className="profile-header-info">
            <h1>{user.name}</h1>
            <p className="profile-role">{user.role || 'Community Member'}</p>
            <p className="profile-email"><Mail size={14} /> {user.email}</p>
            {user.joinedAt && <p className="profile-joined"><Calendar size={14} /> Joined {user.joinedAt}</p>}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">24</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">156</span>
            <span className="stat-label">Comments</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">1.2k</span>
            <span className="stat-label">Votes Received</span>
          </div>
        </div>

        <div className="profile-tabs">
          <button className="profile-tab active">Activity</button>
          <button className="profile-tab">Posts</button>
          <button className="profile-tab">Comments</button>
          <button className="profile-tab">Votes</button>
        </div>

        <div className="profile-content">
          <div className="coming-soon">
            <Crown size={48} />
            <h3>Profile page</h3>
            <p>Your activity feed will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { User, Mail, Lock, Save, X } from 'lucide-react';

export function EditProfilePage({ user, onClose }: { user: { name: string; email: string; avatarUrl?: string; avatarColor?: string }; onClose: () => void }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

  const getInitials = (name: string) => name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    alert('Profile updated successfully!');
    onClose();
  };

  return (
    <div className="page-container">
      <div className="edit-profile-page">
        <div className="page-header">
          <h1>Edit Profile</h1>
          <button className="outline-button" onClick={onClose}><X size={16} /> Cancel</button>
        </div>

        <form onSubmit={handleSave} className="edit-profile-form">
          <div className="form-section">
            <h2>Profile Photo</h2>
            <div className="avatar-upload">
              <div className="avatar-preview">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" />
                ) : (
                  <span className={`avatar-initials ${getAvatarColor(name)}`}>{getInitials(name)}</span>
                )}
              </div>
              <div className="avatar-controls">
                <label className="file-upload-button">
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => setAvatarUrl(event.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <span>Change Photo</span>
                </label>
                <p className="form-hint">JPG, PNG or WebP. Max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="name">Display Name</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Change Password</h2>
            <div className="form-field">
              <label htmlFor="password">New Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  minLength={8}
                />
              </div>
              <p className="form-hint">Leave blank to keep current password.</p>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="outline-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button"><Save size={16} /> Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
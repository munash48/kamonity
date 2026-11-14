import React, { useState } from 'react';
import { Bell, Shield, Palette, Moon, Sun, Globe, Save } from 'lucide-react';

type Preferences = {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  language: string;
  timezone: string;
};

export function PreferencesPage({ onClose }: { onClose: () => void }) {
  const [prefs, setPrefs] = useState<Preferences>({
    theme: 'system',
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    language: 'en',
    timezone: 'UTC',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Preferences saved!');
    onClose();
  };

  return (
    <div className="page-container">
      <div className="preferences-page">
        <div className="page-header">
          <h1>Preferences</h1>
          <button className="outline-button" onClick={onClose}>Done</button>
        </div>

        <form onSubmit={handleSave} className="preferences-form">
          <div className="pref-section">
            <h2><Palette size={18} /> Appearance</h2>
            <div className="pref-field">
              <label>Theme</label>
              <div className="theme-options">
                <label className="theme-option">
                  <input type="radio" name="theme" value="light" checked={prefs.theme === 'light'} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value as 'light' | 'dark' | 'system' })} />
                  <span className="theme-option-content">
                    <Sun size={20} />
                    <div>
                      <strong>Light</strong>
                      <small>Always use light mode</small>
                    </div>
                  </span>
                </label>
                <label className="theme-option">
                  <input type="radio" name="theme" value="dark" checked={prefs.theme === 'dark'} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value as 'light' | 'dark' | 'system' })} />
                  <span className="theme-option-content">
                    <Moon size={20} />
                    <div>
                      <strong>Dark</strong>
                      <small>Always use dark mode</small>
                    </div>
                  </span>
                </label>
                <label className="theme-option">
                  <input type="radio" name="theme" value="system" checked={prefs.theme === 'system'} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value as 'light' | 'dark' | 'system' })} />
                  <span className="theme-option-content">
                    <Monitor size={20} />
                    <div>
                      <strong>System</strong>
                      <small>Match system setting</small>
                    </div>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="pref-section">
            <h2><Bell size={18} /> Notifications</h2>
            <div className="pref-field">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={prefs.emailNotifications}
                  onChange={(e) => setPrefs({ ...prefs, emailNotifications: e.target.checked })}
                />
                <span className="toggle-slider"></span>
                <div>
                  <strong>Email notifications</strong>
                  <small>Receive email updates about activity</small>
                </div>
              </label>
            </div>
            <div className="pref-field">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={prefs.pushNotifications}
                  onChange={(e) => setPrefs({ ...prefs, pushNotifications: e.target.checked })}
                />
                <span className="toggle-slider"></span>
                <div>
                  <strong>Push notifications</strong>
                  <small>Receive browser push notifications</small>
                </div>
              </label>
            </div>
            <div className="pref-field">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={prefs.weeklyDigest}
                  onChange={(e) => setPrefs({ ...prefs, weeklyDigest: e.target.checked })}
                />
                <span className="toggle-slider"></span>
                <div>
                  <strong>Weekly digest</strong>
                  <small>Receive a weekly summary email</small>
                </div>
              </label>
            </div>
          </div>

          <div className="pref-section">
            <h2><Shield size={18} /> Privacy & Security</h2>
            <div className="pref-field">
              <button type="button" className="outline-button">Change Password</button>
              <button type="button" className="outline-button">Two-Factor Authentication</button>
              <button type="button" className="outline-button">Connected Apps</button>
            </div>
          </div>

          <div className="pref-section">
            <h2><Globe size={18} /> Language & Region</h2>
            <div className="pref-field">
              <label htmlFor="language">Language</label>
              <select id="language" value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div className="pref-field">
              <label htmlFor="timezone">Timezone</label>
              <select id="timezone" value={prefs.timezone} onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (US)</option>
                <option value="America/Chicago">Central Time (US)</option>
                <option value="America/Denver">Mountain Time (US)</option>
                <option value="America/Los_Angeles">Pacific Time (US)</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="outline-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button"><Save size={16} /> Save Preferences</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Monitor({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { User, Settings, Bell, HelpCircle, LogOut, Edit } from 'lucide-react';

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  avatarColor?: string;
};

export type MenuItem = {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  divider?: boolean;
};

const defaultItems: MenuItem[] = [
  { label: 'View profile', icon: <User size={16} /> },
  { label: 'Edit profile', icon: <Edit size={16} /> },
  { label: 'Preferences', icon: <Settings size={16} /> },
  { label: 'Notifications', icon: <Bell size={16} /> },
  { label: 'Help & support', icon: <HelpCircle size={16} /> },
  { divider: true },
  { label: 'Log out', icon: <LogOut size={16} />, destructive: true },
];

export function ProfileMenu({ user, onLogout, items }: { user: UserProfile | null; onLogout: () => void; items?: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLButtonElement[]>([]);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const menuItems = useMemo(() => {
    const merged = items?.length ? items : defaultItems;
    return merged.map(item => ({
      ...item,
      onClick: item.onClick ?? (item.label === 'Log out' ? onLogout : undefined),
    }));
  }, [items, onLogout]);

  const validItems = useMemo(() => menuItems.filter(item => !item.divider), [menuItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (validItems.length === 0) return;

      switch (e.key) {
        case 'Escape':
          closeMenu();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex(prev => {
            const next = prev + 1;
            return next >= validItems.length ? 0 : next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex(prev => {
            const next = prev - 1;
            return next < 0 ? validItems.length - 1 : next;
          });
          break;
        case 'Home':
          e.preventDefault();
          setFocusIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusIndex(validItems.length - 1);
          break;
        case 'Tab':
          closeMenu();
          break;
        case 'Enter':
        case ' ':
          if (focusIndex >= 0 && focusIndex < validItems.length) {
            e.preventDefault();
            const targetItem = validItems[focusIndex];
            const targetIndex = menuItems.findIndex(m => m === targetItem);
            if (targetIndex >= 0) {
              itemsRef.current[targetIndex]?.click();
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, menuItems, validItems]);

  useEffect(() => {
    if (open) {
      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
            triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
          closeMenu();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    if (open && !reduced && focusIndex >= 0 && focusIndex < validItems.length) {
      requestAnimationFrame(() => {
        const targetItem = validItems[focusIndex];
        const targetIndex = menuItems.findIndex(m => m === targetItem);
        if (targetIndex >= 0) {
          itemsRef.current[targetIndex]?.focus();
        }
      });
    }
  }, [focusIndex, open, reduced, menuItems, validItems]);

  const closeMenu = () => {
    setOpen(false);
    setFocusIndex(-1);
    triggerRef.current?.focus();
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
    closeMenu();
  };

  const getInitials = (name: string) => {
    return name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (!user) {
    return (
      <div className="profile-menu-guest">
        <a href="/login" className="outline-button">Log in</a>
        <a href="/signup" className="primary-button">Sign up</a>
      </div>
    );
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        ref={triggerRef}
        className="profile-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        onClick={() => { setOpen(!open); setFocusIndex(open ? -1 : 0); }}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="profile-avatar"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : null}
        {!user.avatarUrl && (
          <span className={`profile-avatar-initials ${user.avatarColor || getAvatarColor(user.name)}`}>
            {getInitials(user.name)}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`profile-dropdown ${reduced ? 'no-animation' : ''}`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="profile-avatar-large" />
              ) : (
                <span className={`profile-avatar-initials-large ${user.avatarColor || getAvatarColor(user.name)}`}>
                  {getInitials(user.name)}
                </span>
              )}
            </div>
            <div className="profile-dropdown-info">
              <div className="profile-dropdown-name">{user.name}</div>
              <div className="profile-dropdown-email">{user.email}</div>
            </div>
          </div>

          <div className="profile-dropdown-divider" />

          <nav className="profile-dropdown-list">
            {menuItems.map((item, index) => {
              if (item.divider) {
                return <div key={`divider-${index}`} className="profile-dropdown-divider" />;
              }
              return (
                <button
                  key={item.label ?? index}
                  ref={(el) => { if (el) itemsRef.current[index] = el; }}
                  role="menuitem"
                  tabIndex={focusIndex === index ? 0 : -1}
                  className={`profile-dropdown-item ${item.destructive ? 'destructive' : ''}`}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setFocusIndex(index)}
                >
                  <span className="profile-dropdown-icon">{item.icon}</span>
                  <span className="profile-dropdown-label">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
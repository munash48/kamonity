import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CalendarDays, Compass, Crown, Home, Moon, Plus, Search, Sun, Users, Video, LogOut, User, Settings, HelpCircle, Edit } from 'lucide-react';
import { communityApi, type LeaderboardEntry, type NotificationItem, type PostComment, type UploadedMedia } from './api';
import { useCommunity, type Post } from './store';
import { formatRelativeTime } from './time';
import { PostComposer, PostComposerState } from './components/PostComposer';
import { ProfileMenu } from './components/ProfileMenu';
import { ProfilePage } from './components/ProfilePage';
import { EditProfilePage } from './components/EditProfilePage';
import { PreferencesPage } from './components/PreferencesPage';
import { NotificationsPage } from './components/NotificationsPage';
import { HelpPage } from './components/HelpPage';

const tabs = ['Feed', 'Trending', 'Groups', 'Events', 'Videos', 'Advertisements'];
const modules = ['Billionaires', 'Employment (ERM)', 'Spaces (Rent)', 'Sacco App', 'Investment', 'Education (School-EMIS)', 'Faith (FMIS)', 'Web-pages', 'Markets', 'Assets (Registry)', 'My Profile', 'Settings'];
const initials = (s: string) => s.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();

function Face({ name }: { name: string }) {
  return <span className="avatar avatar-lavender">{initials(name)}</span>;
}

function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  return (
    <div className="post-modal-backdrop" onClick={close}>
      <section className="post-modal" onClick={e => e.stopPropagation()}>
        <button className="post-modal-close" onClick={close}>Close</button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}

function Reel({ media, reduced }: { media: UploadedMedia; reduced: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (reduced || !ref.current) return;
    const observer = new IntersectionObserver(
      es => es.forEach(e => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting && e.intersectionRatio >= .5) {
          v.muted = true;
          void v.play().catch(() => { });
        } else v.pause();
      }),
      { threshold: [0, .5, 1] }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [media.id, reduced]);
  return (
    <article className="reel-card">
      <video ref={ref} src={media.url} poster={media.posterUrl || undefined} muted playsInline loop controls />
      <p>Reel · {media.durationSeconds || '—'} sec</p>
    </article>
  );
}

export default function App() {
  const { dark, toggleTheme, activeTab, setTab, activeModule, setModule, posts, setPosts, setApiConnected, currentUser, setCurrentUser } = useCommunity();
  const [userId, setUserId] = useState(() => Number(localStorage.getItem('kommunity-demo-user-id') || 1));
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [reels, setReels] = useState<UploadedMedia[]>([]);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteKind, setInviteKind] = useState<'email' | 'whatsapp'>('email');
  const [inviteValue, setInviteValue] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [waUrl, setWaUrl] = useState('');

  const [details, setDetails] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  const [composerState, setComposerState] = useState<PostComposerState>({
    text: '',
    mode: 'text',
    url: '',
    file: null,
    trimStart: 0,
    trimEnd: 60,
  });

  const [media, setMedia] = useState<UploadedMedia | null>(null);
  const [busy, setBusy] = useState(false);

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeItems, setNoticeItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const noticeRef = useRef<HTMLDivElement>(null);

  const [reportOpen, setReportOpen] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState('');

  const [profilePage, setProfilePage] = useState<'profile' | 'edit' | 'preferences' | 'notifications' | 'help' | null>(null);

  const [query, setQuery] = useState('');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches ||
    Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('kommunity-demo-user-id', String(userId));
  }, [userId]);

  useEffect(() => {
    let alive = true;
    Promise.all([communityApi.getPosts(), communityApi.getUsers(), communityApi.getLeaderboard()])
      .then(([p, u, l]) => {
        if (!alive) return;
        setPosts(p);
        setLeaders(l);
        setApiConnected(true);
        if (u.length && !u.some(x => x.id === userId)) setUserId(u[0].id);
        // Set current user profile
        const user = u.find(x => x.id === userId);
        if (user) {
          setCurrentUser({
            id: user.id,
            name: user.name,
            email: `${user.name.toLowerCase().replace(/\s+/g, '.')}@kommunity.app`,
            avatarUrl: null,
            avatarColor: undefined,
          });
        }
      })
      .catch(() => setApiConnected(false));
    return () => { alive = false; };
  }, [setPosts, setApiConnected, userId, setCurrentUser]);

  useEffect(() => {
    if (activeTab === 'Videos') {
      communityApi.getMediaFeed().then(setReels).catch(() => setReels([]));
    }
  }, [activeTab]);

  useEffect(() => {
    if (!noticeOpen) return;
    const f = (e: MouseEvent) => {
      if (noticeRef.current && !noticeRef.current.contains(e.target as Node)) setNoticeOpen(false);
    };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, [noticeOpen]);

  const refresh = async () => {
    setPosts(await communityApi.getPosts());
    setLeaders(await communityApi.getLeaderboard());
  };

  const notices = async () => {
    if (noticeOpen) { setNoticeOpen(false); return; }
    setNoticeOpen(true);
    const b = await communityApi.getNotifications(userId);
    const shown = b.items.slice(0, 5);
    setNoticeItems(shown);
    setUnread(b.unreadCount);
    if (shown.length) setUnread((await communityApi.markNotificationsViewed(userId, shown.map(n => n.id))).unreadCount);
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let asset: UploadedMedia | undefined;
      const { text, file } = composerState;

      if (file) {
        const kind = file.type.startsWith('video/') ? 'reel' : 'photo';
        asset = await communityApi.uploadMedia(userId, kind, file, composerState.trimStart, composerState.trimEnd);
        if (asset.status === 'FAILED') throw Error(asset.failureReason || 'Media failed');
        if (asset.status === 'PROCESSING') {
          setError('Reel processing; it appears in Videos when ready.');
          setComposerState(s => ({ ...s, file: null, text: '' }));
          return;
        }
        setMedia(asset);
      }

      const body = text.trim() || composerState.url.trim() || (asset ? 'Media attachment' : '');
      if (!body) return;

      const p = await communityApi.createPost(text.trim() || composerState.url.trim(), userId, asset?.id);
      setPosts([p, ...posts]);
      setComposerState({ text: '', mode: 'text', url: '', file: null, trimStart: 0, trimEnd: 60 });
      setMedia(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const openDetails = async (p: Post) => {
    setDetails(p);
    try {
      setComments(await communityApi.getComments(p.id));
    } catch (e) {
      setError(String(e));
    }
  };

  const commentPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details || !commentText.trim()) return;
    try {
      await communityApi.createComment(details.id, userId, commentText.trim());
      setComments(await communityApi.getComments(details.id));
      setCommentText('');
      await refresh();
    } catch (e) {
      setError(String(e));
    }
  };

  const addPlace = () => {
    alert('Add Place functionality to be implemented');
  };

  const votePost = async (p: Post) => {
    try {
      await communityApi.vote(p.id, userId);
      await refresh();
    } catch (e) {
      setError(String(e));
    }
  };

  const sharePost = async (p: Post) => {
    try {
      await communityApi.sharePost(p.id, userId);
      await refresh();
    } catch (e) {
      setError(String(e));
    }
  };

  const addInlineComment = async (e: React.FormEvent, p: Post) => {
    e.preventDefault();
    if (!drafts[p.id]?.trim()) return;
    try {
      await communityApi.createComment(p.id, userId, drafts[p.id].trim());
      setDrafts({ ...drafts, [p.id]: '' });
      await refresh();
    } catch (e) {
      setError(String(e));
    }
  };

  const openReport = (p: Post) => {
    setReportOpen(p);
    setReportReason('');
  };

  const closeReport = () => {
    setReportOpen(null);
    setReportReason('');
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    try {
      await communityApi.reportPost(reportOpen!.id, userId, 'OTHER', reportReason.trim());
      await refresh();
      closeReport();
    } catch (e) {
      setError(String(e));
    }
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await communityApi.sendInvitation(userId, inviteKind === 'email' ? { email: inviteValue } : { phone: inviteValue });
      setInviteMessage(r.message);
      setWaUrl(r.whatsappUrl || '');
      await refresh();
    } catch (e) {
      setInviteMessage(String(e));
    }
  };

  const reportPost = (p: Post) => openReport(p);

  const logout = () => {
    setCurrentUser(null);
    setUserId(1);
  };

  const handleProfileMenuItem = (page: 'profile' | 'edit' | 'preferences' | 'notifications' | 'help') => {
    setProfilePage(page);
  };

  function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => (
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="search-highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </>
  );
}

const filtered = useMemo(() => posts.filter(p =>
    `${p.name} ${p.body}`.toLowerCase().includes(query.toLowerCase())
  ), [posts, query]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">K</span>
          <span className="brand-word">KOMMUNITY</span>
        </a>
        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search KOMMUNITY" />
        </label>
        <nav className="top-actions">
          <button className="icon-button" onClick={() => setTab('Feed')} aria-label="Home">
            <Home />
          </button>
          <button className="icon-button" onClick={() => setTab('Trending')} aria-label="Explore">
            <Compass />
          </button>
          <button className="icon-button" onClick={() => setTab('Groups')} aria-label="Groups">
            <Users />
          </button>
          <button className="icon-button" onClick={() => setTab('Events')} aria-label="Events">
            <CalendarDays />
          </button>
          <div ref={noticeRef}>
            <button className="icon-button notification-anchor" onClick={() => void notices()} aria-label={`Notifications ${unread} unread`}>
              <Bell />
              {unread > 0 && <i>{Math.min(unread, 99)}</i>}
            </button>
            {noticeOpen && (
              <div className="notification-popover">
                <b>Notifications · {unread} unread</b>
                {noticeItems.map(n => (
                  <button key={n.id} className="notification-menu-item" onClick={() => {
                    setNoticeOpen(false);
                    if (n.deepLink) location.assign(n.deepLink);
                  }}>
                    {n.message}
                    <small>{formatRelativeTime(n.createdAt)}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="icon-button" onClick={toggleTheme}>
            {dark ? <Sun /> : <Moon />}
          </button>
          <ProfileMenu
            user={currentUser}
            onLogout={logout}
            items={[
              { label: 'View profile', icon: <User size={16} />, onClick: () => handleProfileMenuItem('profile') },
              { label: 'Edit profile', icon: <Edit size={16} />, onClick: () => handleProfileMenuItem('edit') },
              { label: 'Preferences', icon: <Settings size={16} />, onClick: () => handleProfileMenuItem('preferences') },
              { label: 'Notifications', icon: <Bell size={16} />, onClick: () => handleProfileMenuItem('notifications') },
              { label: 'Help & support', icon: <HelpCircle size={16} />, onClick: () => handleProfileMenuItem('help') },
              { divider: true },
              { label: 'Log out', icon: <LogOut size={16} />, onClick: logout, destructive: true },
            ]}
          />
        </nav>
      </header>

      <main className="layout-grid">
        <aside className="left-column">
          <section className="side-card menu-card">
            <div className="side-heading">YOUR KOMMUNITY</div>
            {modules.map((m, i) => (
              <button key={m} className={`menu-item ${activeModule === m ? 'menu-active' : ''}`}
                onClick={() => { setModule(m); setTab(i === 0 ? 'Feed' : 'Coming Soon'); }}>
                <span className="menu-icon">{i === 0 ? <Crown size={16} /> : <Users size={16} />}</span>
                <span>{m}</span>
              </button>
            ))}
          </section>
        </aside>

        <section className="feed-column">
          <div className="welcome-line">
            <div>
              <span className="eyebrow">KOMMUNITY · YOUR NETWORK</span>
              <h1>Your community, <em>in motion.</em></h1>
            </div>
            <button className="outline-button" onClick={() => setInviteOpen(true)}>
              <Plus size={14} /> Invite
            </button>
          </div>

          <nav className="feed-tabs">
            {tabs.map(t => (
              <button key={t} className={activeTab === t ? 'tab-active' : ''} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </nav>

          {activeTab === 'Videos' ? (
            <section className="reels-feed">
              {reels.length ? reels.map(r => <Reel key={r.id} media={r} reduced={reduced} />) : (
                <div className="coming-card">
                  <Video />
                  <h2>No ready Reels</h2>
                  <p>Media appears after processing.</p>
                </div>
              )}
            </section>
          ) : (
            <>
              {!query && (
                <>
                  <PostComposer
                    state={composerState}
                    setState={setComposerState}
                    busy={busy}
                    onSubmit={publish}
                    userId={userId}
                    media={media}
                  />
                  {error && <p role="alert">{error}</p>}
                </>
              )}

              <div className="posts-list">
                {filtered.map(p => (
                  <article className="post-card" key={p.id}>
                    <header className="post-header">
                      <Face name={p.name} />
                      <div className="post-author">
                        <b>{p.name}</b>
                        <small>{p.time}</small>
                      </div>
                    </header>

                    <button className="post-body post-body-open" onClick={() => void openDetails(p)}>
                      {query ? (
                        <HighlightedText text={p.body} query={query} />
                      ) : (
                        <> {p.body} · Details </>
                      )}
                    </button>

                    {p.media && (
                      p.media.type === 'PHOTO' ? (
                        <img className="post-media" src={p.media.url} alt="Post media" />
                      ) : (
                        <video className="post-media" src={p.media.url} poster={p.media.posterUrl || undefined} controls muted playsInline />
                      )
                    )}

                    <form className="inline-comment-form" onSubmit={e => void addInlineComment(e, p)}>
                      <input
                        placeholder="Write a comment"
                        value={drafts[p.id] || ''}
                        onChange={e => setDrafts({ ...drafts, [p.id]: e.target.value })}
                      />
                      <button className="primary-button">Comment</button>
                    </form>

                    <div className="post-stats">
                      <span>{p.votes} votes</span>
                      <span>{p.comments} comments</span>
                      <span>{p.shares} shares</span>
                      <span>{p.reportCount || 0} reports</span>
                    </div>

                    <div className="post-actions">
                      <button onClick={() => void votePost(p)}>Vote</button>
                      <button onClick={() => void openDetails(p)}>Comment</button>
                      <button onClick={() => void sharePost(p)}>Share</button>
                      <button onClick={() => void reportPost(p)}>Report</button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="right-column">
          <section className="add-place-placeholder" onClick={addPlace}>
            <Plus className="plus-icon" size={28} />
            <div className="label">Add Place</div>
          </section>
          <section className="right-panel" style={{ marginTop: 14 }}>
            <h3>Leaderboard</h3>
            {leaders.slice(0, 5).map((u, i) => (
              <div className="leader-row" key={u.name}>
                <span>{i + 1}</span>
                <b>{u.name}</b>
                <span>{u.points} pts</span>
              </div>
            ))}
          </section>
        </aside>
      </main>

      {details && (
        <Modal title={`${details.name}'s post`} close={() => setDetails(null)}>
          <p>{details.body}</p>
          <div className="modal-post-stats">
            <span>{details.votes} votes</span>
            <span>{details.comments} comments</span>
            <span>{details.shares} shares</span>
            <span>{details.reportCount || 0} reports</span>
          </div>
          {comments.map(c => (
            <p key={c.id}>
              <b>{c.authorName}</b>: {c.content} · {formatRelativeTime(c.createdAt)}
            </p>
          ))}
          <form className="modal-comment-form" onSubmit={commentPost}>
            <div className="modal-comment-input-group">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment"
                maxLength={2000}
              />
              <button type="submit" className="primary-button">Comment</button>
            </div>
          </form>
        </Modal>
      )}

      {inviteOpen && (
        <Modal title="Invite to KOMMUNITY" close={() => setInviteOpen(false)}>
          <div className="invite-switch">
            <button onClick={() => setInviteKind('email')}>Email</button>
            <button onClick={() => setInviteKind('whatsapp')}>WhatsApp</button>
          </div>
          <form onSubmit={invite}>
            <input required type={inviteKind === 'email' ? 'email' : 'tel'} value={inviteValue}
              onChange={e => setInviteValue(e.target.value)}
              placeholder={inviteKind === 'email' ? 'Email address' : 'Phone number'} />
            <button className="primary-button">Send invite</button>
          </form>
          <p>{inviteMessage}</p>
          {waUrl && <a href={waUrl} target="_blank" rel="noreferrer">Open WhatsApp</a>}
        </Modal>
      )}

      {reportOpen && (
        <Modal title="Report Post" close={closeReport}>
          <form onSubmit={submitReport}>
            <textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Reason for reporting..." rows={4} required />
            <div className="modal-actions">
              <button type="button" className="outline-button" onClick={closeReport}>Cancel</button>
              <button type="submit" className="primary-button">Submit Report</button>
            </div>
          </form>
        </Modal>
      )}

      {profilePage === 'profile' && currentUser && (
        <Modal title="Profile" close={() => setProfilePage(null)}>
          <ProfilePage user={{
            name: currentUser.name,
            email: currentUser.email,
            avatarUrl: currentUser.avatarUrl || undefined,
            avatarColor: currentUser.avatarColor,
            role: 'Community Member',
            joinedAt: '2024',
          }} />
        </Modal>
      )}

      {profilePage === 'edit' && currentUser && (
        <Modal title="Edit Profile" close={() => setProfilePage(null)}>
          <EditProfilePage user={{
            name: currentUser.name,
            email: currentUser.email,
            avatarUrl: currentUser.avatarUrl || undefined,
            avatarColor: currentUser.avatarColor,
          }} onClose={() => setProfilePage(null)} />
        </Modal>
      )}

      {profilePage === 'preferences' && currentUser && (
        <Modal title="Preferences" close={() => setProfilePage(null)}>
          <PreferencesPage onClose={() => setProfilePage(null)} />
        </Modal>
      )}

      {profilePage === 'notifications' && (
        <Modal title="Notifications" close={() => setProfilePage(null)}>
          <NotificationsPage onClose={() => setProfilePage(null)} />
        </Modal>
      )}

      {profilePage === 'help' && (
        <Modal title="Help & Support" close={() => setProfilePage(null)}>
          <HelpPage onClose={() => setProfilePage(null)} />
        </Modal>
      )}
    </div>
  );
}
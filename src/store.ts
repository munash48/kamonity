import { create } from 'zustand';

export type Post = {
  id: number;
  name: string;
  role: string;
  time: string;
  body: string;
  tags: string[];
  votes: number;
  comments: number;
  shares: number;
  reportCount?: number;
  voted: boolean;
  avatar: string;
  tone: string;
  media?: { id: number; type: string; url: string; posterUrl: string | null; width: number | null; height: number | null; durationSeconds: number | null } | null;
};

type CommunityState = {
  dark: boolean;
  activeTab: string;
  activeModule: string;
  chatOpen: boolean;
  composer: string;
  posts: Post[];
  apiConnected: boolean;
  setPosts: (posts: Post[]) => void;
  setApiConnected: (connected: boolean) => void;
  toggleTheme: () => void;
  setTab: (tab: string) => void;
  setModule: (module: string) => void;
  setChatOpen: (open: boolean) => void;
  setComposer: (text: string) => void;
  addPost: () => void;
  vote: (id: number) => void;
  share: (id: number) => void;
  comment: (id: number) => void;
};

const initialPosts: Post[] = [
  {
    id: 1,
    name: 'Jamor Kamm',
    role: 'Billionaire',
    time: '2h ago · Public',
    body: 'Just wrapped up our Q4 investment discussions. Excited to see new opportunities in the Sacco ecosystem — especially around sustainable real estate ventures. What are your thoughts on diversifying through community-driven funds?',
    tags: ['#SaccoApp', '#InvestSmart', '#KommUnity'],
    votes: 124,
    comments: 8,
    shares: 3,
    voted: false,
    avatar: 'JK',
    tone: 'lavender',
  },
  {
    id: 2,
    name: 'Amina Nansubuga',
    role: 'Community builder',
    time: '4h ago · Public',
    body: 'Small businesses grow stronger when we grow together. This week our group welcomed 18 new founders. What is one lesson you wish you knew when you started?',
    tags: ['#BuildTogether', '#Founders'],
    votes: 86,
    comments: 12,
    shares: 5,
    voted: false,
    avatar: 'AN',
    tone: 'peach',
  },
];

const getInitialTheme = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('kommunity-theme') === 'dark';
};

export const useCommunity = create<CommunityState>((set, get) => ({
  dark: getInitialTheme(),
  activeTab: 'Feed',
  activeModule: 'Billionaires',
  chatOpen: false,
  composer: '',
  posts: initialPosts,
  apiConnected: false,
  setPosts: (posts) => set({ posts }),
  setApiConnected: (apiConnected) => set({ apiConnected }),
  toggleTheme: () =>
    set((state) => {
      const dark = !state.dark;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kommunity-theme', dark ? 'dark' : 'light');
      }
      return { dark };
    }),
  setTab: (activeTab) => set({ activeTab }),
  setModule: (activeModule) => set({ activeModule }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setComposer: (composer) => set({ composer }),
  addPost: () => {
    const text = get().composer.trim();
    if (!text) return;
    set((state) => ({
      composer: '',
      posts: [
        {
          id: Date.now(),
          name: 'Jamor Kamm',
          role: 'Billionaire',
          time: 'Just now · Public',
          body: text,
          tags: [],
          votes: 0,
          comments: 0,
          shares: 0,
          voted: false,
          avatar: 'JK',
          tone: 'lavender',
        },
        ...state.posts,
      ],
    }));
  },
  vote: (id) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id
          ? { ...post, voted: !post.voted, votes: post.votes + (post.voted ? -1 : 1) }
          : post,
      ),
    })),
  share: (id) =>
    set((state) => ({ posts: state.posts.map((post) => (post.id === id ? { ...post, shares: post.shares + 1 } : post)) })),
  comment: (id) =>
    set((state) => ({ posts: state.posts.map((post) => (post.id === id ? { ...post, comments: post.comments + 1 } : post)) })),
}));

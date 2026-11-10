import { beforeEach, describe, expect, it } from 'vitest';
import { useCommunity } from './store';

describe('community feed store', () => {
  beforeEach(() => {
    useCommunity.setState({
      activeTab: 'Feed',
      activeModule: 'Billionaires',
      composer: '',
      posts: [
        {
          id: 1,
          name: 'Test member',
          role: 'Member',
          time: 'Just now',
          body: 'A test post',
          tags: [],
          votes: 0,
          comments: 0,
          shares: 0,
          voted: false,
          avatar: 'TM',
          tone: 'blue',
        },
      ],
    });
  });

  it('persists dark mode selection in localStorage', () => {
    useCommunity.getState().toggleTheme();
    expect(useCommunity.getState().dark).toBe(true);
    expect(window.localStorage.getItem('kommunity-theme')).toBe('dark');

    useCommunity.getState().toggleTheme();
    expect(useCommunity.getState().dark).toBe(false);
    expect(window.localStorage.getItem('kommunity-theme')).toBe('light');
  });

  it('publishes a non-empty post to the top of the feed', () => {
    useCommunity.getState().setComposer('Hello, KOMMUNITY!');
    useCommunity.getState().addPost();

    expect(useCommunity.getState().posts[0].body).toBe('Hello, KOMMUNITY!');
    expect(useCommunity.getState().composer).toBe('');
    expect(useCommunity.getState().posts).toHaveLength(2);
  });

  it('toggles a vote and its count', () => {
    useCommunity.getState().vote(1);
    expect(useCommunity.getState().posts[0]).toMatchObject({ voted: true, votes: 1 });

    useCommunity.getState().vote(1);
    expect(useCommunity.getState().posts[0]).toMatchObject({ voted: false, votes: 0 });
  });
});

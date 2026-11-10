import { afterEach, describe, expect, it, vi } from 'vitest';
import { communityApi } from './api';

describe('community API client', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
  it('loads posts and maps the backend model', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 7, authorName: 'Ada Lovelace', content: 'Hello #KOMMUNITY', points: 3, votes: 2, comments: 1, shares: 0, createdAt: '2025-01-01T00:00:00Z' }] }));
    const posts = await communityApi.getPosts();
    expect(posts[0]).toMatchObject({ id: 7, name: 'Ada Lovelace', body: 'Hello #KOMMUNITY', votes: 2, tags: ['#KOMMUNITY'] });
  });
  it('loads comments for selected post', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 2, userId: 4, authorName: 'Amina', content: 'Thanks!', createdAt: '2026-01-01T00:00:00Z' }] });
    vi.stubGlobal('fetch', fetchMock);
    const comments = await communityApi.getComments(91);
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/posts/91/comments', expect.any(Object));
    expect(comments[0]).toMatchObject({ authorName: 'Amina', content: 'Thanks!' });
  });
  it('sends a single email invitation for the selected demo user', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ invitationId: 9, unique: true, message: 'sent', whatsappUrl: null }) });
    vi.stubGlobal('fetch', fetchMock);
    await communityApi.sendInvitation(3, { email: 'person@example.com' });
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/invitations/send', expect.objectContaining({ method: 'POST', body: JSON.stringify({ inviterUserId: 3, email: 'person@example.com' }) }));
  });
});

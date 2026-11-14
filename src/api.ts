import type { Post } from './store';
import { formatRelativeTime } from './time';

export type LeaderboardEntry = { userId?: number; name: string; points: number };
export type DemoUser = { id: number; name: string; points: number };
export type PostComment = { id: number; userId: number; authorName: string; content: string; createdAt: string };
export type InvitationResponse = { invitationId: number; unique: boolean; message: string; whatsappUrl: string | null };
export type NotificationItem = { id: number; postId: number | null; activityType: string; digestCount: number; message: string; deepLink: string | null; createdAt: string; readAt: string | null };
export type NotificationBatch = { items: NotificationItem[]; unreadCount: number };
export type UploadedMedia = { id: number; type: 'PHOTO'|'REEL'; status: 'PROCESSING'|'READY'|'FAILED'; url: string; posterUrl: string|null; width: number|null; height: number|null; durationSeconds: number|null; failureReason: string|null };
export type PostReportResponse = { postId: number; reportCount: number; status: string };

type ApiPost = {
  id: number;
  authorName: string;
  author?: { id: number; name: string };
  content: string;
  points: number;
  votes: number;
  comments: number;
  shares: number;
  reportCount?: number;
  createdAt: string;
  media?: UploadedMedia | null;
};

function mapPost(post: ApiPost): Post {
  return { id: post.id, name: post.author?.name ?? post.authorName, role: 'Community member', time: formatRelativeTime(post.createdAt), body: post.content, tags: post.content.match(/#[\w]+/g) ?? [], votes: post.votes, comments: post.comments, shares: post.shares, reportCount: post.reportCount ?? 0, voted: false, avatar: post.authorName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(), tone: 'lavender', media: post.media ?? null };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try { const body = await response.json(); if (body.message) message = body.message; } catch { /* ignore response parsing */ }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const communityApi = {
  async getPosts(): Promise<Post[]> { return (await request<ApiPost[]>('/posts')).map(mapPost); },
  getUsers(): Promise<DemoUser[]> { return request<DemoUser[]>('/users'); },
  getUserVotes(userId: number): Promise<number[]> { return request<number[]>(`/users/${userId}/votes`); },
  async createPost(content: string, authorId: number, mediaAssetId?: number): Promise<Post> { return mapPost(await request<ApiPost>('/posts', { method: 'POST', body: JSON.stringify({ authorId, content, mediaAssetId }) })); },
  async vote(id: number, userId: number): Promise<Post> { return mapPost(await request<ApiPost>(`/posts/${id}/vote`, { method: 'POST', body: JSON.stringify({ userId }) })); },
  getComments(postId: number): Promise<PostComment[]> { return request<PostComment[]>(`/posts/${postId}/comments`); },
  createComment(postId: number, userId: number, content: string): Promise<PostComment> { return request<PostComment>(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ userId, content }) }); },
  sendInvitation(inviterUserId: number, contact: { email?: string; phone?: string }): Promise<InvitationResponse> { return request<InvitationResponse>('/invitations/send', { method: 'POST', body: JSON.stringify({ inviterUserId, ...contact }) }); },
  async sharePost(postId: number, userId: number): Promise<void> { await request(`/posts/${postId}/share`, { method: 'POST', body: JSON.stringify({ userId }) }); },
  reportPost(postId:number,userId:number,reasonCode:string,details=''):Promise<PostReportResponse>{return request<PostReportResponse>(`/posts/${postId}/report`,{method:'POST',body:JSON.stringify({userId,reasonCode,details})});},

  getNotifications(userId: number): Promise<NotificationBatch> { return request<NotificationBatch>(`/users/${userId}/notifications`); },
  markNotificationsViewed(userId: number, ids: number[]): Promise<NotificationBatch> { return request<NotificationBatch>(`/users/${userId}/notifications/mark-viewed`, { method: 'POST', body: JSON.stringify({ ids }) }); },
  async uploadMedia(userId:number,kind:'photo'|'reel',file:File,trimStartSeconds=0,trimEndSeconds?:number):Promise<UploadedMedia>{
    const form=new FormData();form.append('file',file);
    const query=new URLSearchParams({userId:String(userId),kind,trimStartSeconds:String(trimStartSeconds)});
    if(trimEndSeconds!==undefined)query.set('trimEndSeconds',String(trimEndSeconds));
    const response=await fetch(`/api/v1/media/upload?${query}`,{method:'POST',body:form});
    if(!response.ok){let message=`Upload failed (${response.status})`;try{const body=await response.json();if(body.message)message=body.message;}catch{/* ignore */}throw new Error(message);}
    return response.json() as Promise<UploadedMedia>;
  },
  getMediaFeed():Promise<UploadedMedia[]>{return request<UploadedMedia[]>('/media/feed');},
  recordMediaView(mediaId:number,sessionKey:string):Promise<{accepted:boolean}>{return request(`/media/${mediaId}/view`,{method:'POST',headers:{'X-Viewer-Session':sessionKey}});},
  getLeaderboard(): Promise<LeaderboardEntry[]> { return request<LeaderboardEntry[]>('/leaderboard'); },
};

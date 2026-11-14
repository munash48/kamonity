import React, { useEffect, useRef, useState } from 'react';
import { Video, Upload, X, Smile, Image as ImageIcon } from 'lucide-react';
import { UploadedMedia } from '../api';

export const MAX_CHAR_COUNT = 2000;
export const MAX_FILE_COUNT = 10;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_VIDEO_FILE_SIZE_MB = 100;
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export type PostMode = 'text' | 'image-url' | 'video-url' | 'upload';

export interface PostComposerState {
  text: string;
  mode: PostMode;
  url: string;
  file: File | null;
  trimStart: number;
  trimEnd: number;
}

export interface PostComposerProps {
  state: PostComposerState;
  setState: React.Dispatch<React.SetStateAction<PostComposerState>>;
  busy: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  userId: number;
  media: UploadedMedia | null;
}

export function PostComposer({ state, setState, busy, onSubmit }: PostComposerProps) {
  const [dragOver, setDragOver] = useState(false);
  const [urlPreview, setUrlPreview] = useState<{
    title: string;
    description: string;
    image: string;
    url: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.mode === 'text' && state.url.trim()) {
      detectLinkPreview(state.url);
    }
  }, [state.url, state.mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHAR_COUNT) {
      setState(s => ({ ...s, text: value }));
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setState(s => ({ ...s, url: value }));
  };

  const handleModeChange = (mode: PostMode) => {
    setState(s => ({ ...s, mode, url: '', file: null }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    // Note: kind is determined by backend based on file type

    setState(s => ({ ...s, mode: 'upload', file }));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeFile = () => {
    setState(s => ({ ...s, file: null }));
  };

  const clearUrl = () => {
    setState(s => ({ ...s, url: '' }));
  };

  const detectLinkPreview = async (url: string) => {
    if (!url || !url.startsWith('http')) {
      setUrlPreview(null);
      return;
    }

    try {
      const response = await fetch('/api/v1/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        setUrlPreview(data);
      } else {
        setUrlPreview(null);
      }
    } catch {
      setUrlPreview(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const fileSizeDisplay = state.file ? formatBytes(state.file.size) : '';

  const canSubmit = state.text.trim() || state.url.trim() || state.file !== null;
  const isValidFileType = state.file ? SUPPORTED_IMAGE_TYPES.includes(state.file.type) || SUPPORTED_VIDEO_TYPES.includes(state.file.type) : true;
  const isValidFileSize = state.file ? SUPPORTED_VIDEO_TYPES.includes(state.file.type)
    ? state.file.size <= MAX_VIDEO_FILE_SIZE_MB * 1024 * 1024
    : state.file.size <= MAX_FILE_SIZE_MB * 1024 * 1024
    : true;

  return (
    <form className="composer-card" onSubmit={(e) => { e.preventDefault(); onSubmit(e); }}>
      <div className="composer-top">
        <textarea
          ref={textareaRef}
          value={state.text}
          onChange={handleInputChange}
          placeholder="What's on your mind?"
          maxLength={MAX_CHAR_COUNT}
          rows={3}
        />
        {state.text.length > 0 && (
          <span className="composer-count">{MAX_CHAR_COUNT - state.text.length}</span>
        )}
      </div>

      {urlPreview && state.mode === 'image-url' && (
        <div className="link-preview">
          <a href={urlPreview.url} target="_blank" rel="noopener noreferrer">
            <img src={urlPreview.image} alt={urlPreview.title} className="link-preview-image" />
            <div className="link-preview-content">
              <h4>{urlPreview.title}</h4>
              <p>{urlPreview.description}</p>
            </div>
          </a>
          <button type="button" className="link-preview-remove" onClick={clearUrl}>
            <X size={16} />
          </button>
        </div>
      )}

      {state.mode === 'video-url' && (
        <div className="link-preview video-preview">
          <div className="video-preview-icon">
            <Video size={32} />
          </div>
          <div className="video-preview-content">
            <strong>Video URL</strong>
            <p>{state.url || 'No URL provided'}</p>
          </div>
          {state.url && (
            <button type="button" className="link-preview-remove" onClick={clearUrl}>
              <X size={16} />
            </button>
          )}
        </div>
      )}

      <div className="composer-tools">
        <button
          type="button"
          onClick={() => handleModeChange('text')}
          className={state.mode === 'text' ? 'composer-tool-active' : ''}
          title="Text only"
        >
          <Smile size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('image-url')}
          className={state.mode === 'image-url' ? 'composer-tool-active' : ''}
          title="Image URL"
        >
          <ImageIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('video-url')}
          className={state.mode === 'video-url' ? 'composer-tool-active' : ''}
          title="Video URL"
        >
          <Video size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('upload')}
          className={state.mode === 'upload' ? 'composer-tool-active' : ''}
          title="Upload media"
        >
          <Upload size={16} />
        </button>
      </div>

      {state.mode === 'image-url' && (
        <div className="composer-input-group">
          <input
            type="url"
            value={state.url}
            onChange={handleUrlChange}
            placeholder="Image URL (optional)"
          />
          {state.url && (
            <button type="button" className="url-clear" onClick={clearUrl}>
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {state.mode === 'video-url' && (
        <div className="composer-input-group">
          <input
            type="url"
            value={state.url}
            onChange={handleUrlChange}
            placeholder="Video URL (optional)"
          />
          {state.url && (
            <button type="button" className="url-clear" onClick={clearUrl}>
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {state.mode === 'upload' && (
        <div
          className={`composer-drop-zone ${dragOver ? 'drag-over' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-zone-content">
            <Upload size={24} />
            <span>Drag files here or click to upload</span>
            <small>JPEG, PNG, WebP (images) or MP4, MOV, WebM (videos)</small>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <button type="button" className="browse-button" onClick={() => fileInputRef.current?.click()}>
              Browse files
            </button>
          </div>
          {state.file && (
            <div className="media-preview">
              <div className="media-thumbnail">
                {state.file.type.startsWith('video/') ? (
                  <div className="video-thumbnail">
                    <Video size={32} />
                    <span className="video-duration">{state.file.name}</span>
                  </div>
                ) : (
                  <img
                    src={URL.createObjectURL(state.file)}
                    alt={state.file.name}
                    className="image-thumbnail"
                    onLoad={(e) => {
                      URL.revokeObjectURL((e.target as HTMLImageElement).src);
                    }}
                  />
                )}
              </div>
              <div className="media-info">
                <div className="media-name">{state.file.name}</div>
                <div className="media-size">{fileSizeDisplay}</div>
              </div>
              <button type="button" className="media-remove" onClick={removeFile}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        className="primary-button"
        disabled={busy || !canSubmit || (!isValidFileType || !isValidFileSize)}
      >
        {busy ? 'Publishing...' : state.file?.type.startsWith('video/') ? 'Publish Reel' : 'Post'}
      </button>
    </form>
  );
}
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Music2, Pause, Play, Upload } from 'lucide-react';

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState('');

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setAudioError('Choose a supported audio file.');
      return;
    }

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const nextUrl = URL.createObjectURL(file);
    setAudioUrl(nextUrl);
    setFileName(file.name);
    setIsPlaying(false);
    setAudioError('');
    if (audioRef.current) audioRef.current.pause();
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      fileInputRef.current?.click();
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      setAudioError('');
    } catch {
      setIsPlaying(false);
      setAudioError('This file could not be played by your browser. Try another audio file.');
    }
  }

  return (
    <section className="music-player" aria-label="Winter soundtrack">
      <div className="music-icon" aria-hidden="true"><Music2 size={17} strokeWidth={1.7} /></div>
      <div className="music-copy">
        <span className="micro-label">A LITTLE WINTER SOUNDTRACK</span>
        <strong>{fileName || 'Snowman — Sia'}</strong>
        <span className="music-subtitle">{fileName ? 'Your local audio file' : 'Use your own audio file to listen here'}</span>
      </div>
      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept="audio/*"
        aria-label="Choose a local audio file"
        onChange={handleFileChange}
      />
      <button className="music-action" type="button" onClick={togglePlayback} aria-label={audioUrl ? (isPlaying ? 'Pause local soundtrack' : 'Play local soundtrack') : 'Choose a local audio file to play'}>
        {audioUrl ? (isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />) : <Upload size={16} />}
      </button>
      <button className="music-choose" type="button" onClick={() => fileInputRef.current?.click()}>
        {audioUrl ? 'Change file' : 'Add file'}
      </button>
      <a
        className="spotify-link"
        href="https://open.spotify.com/search/Sia%20Snowman"
        target="_blank"
        rel="noreferrer"
        aria-label="Find Snowman by Sia on Spotify"
      >
        <span>Spotify</span><ExternalLink size={13} />
      </a>
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      {audioError && <span className="music-error" role="status">{audioError}</span>}
    </section>
  );
}

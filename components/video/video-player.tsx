'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  src: string;
  lessonId: string;
  courseId: string;
  onProgressUpdate?: (watchedSeconds: number) => void;
  initialProgress?: number;
  onComplete?: () => void;
}

export function VideoPlayer({
  src,
  lessonId,
  courseId,
  onProgressUpdate,
  initialProgress = 0,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const progressUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial progress
  useEffect(() => {
    if (videoRef.current && initialProgress > 0) {
      videoRef.current.currentTime = initialProgress;
    }
  }, [initialProgress]);

  // Update progress every 5 seconds
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      progressUpdateIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const watchedSeconds = Math.floor(videoRef.current.currentTime);
          setCurrentTime(watchedSeconds);
          onProgressUpdate?.(watchedSeconds);
        }
      }, 5000); // Update every 5 seconds
    } else {
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }
    }

    return () => {
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }
    };
  }, [isPlaying, onProgressUpdate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const changeVolume = (delta: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = Math.floor(videoRef.current.currentTime);
      setCurrentTime(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onComplete?.();
    // Mark as completed
    onProgressUpdate?.(duration);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Prevent right-click and context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading video</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onContextMenu={handleContextMenu}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={(e) => {
          setError('Failed to load video');
          setIsLoading(false);
        }}
        playsInline
        preload="metadata"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-transparent to-transparent">
        {/* Progress bar */}
        <div className="absolute bottom-16 left-0 right-0 px-4">
          <div
            className="h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => seek(-10)}
            className="text-white hover:bg-white/20"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => seek(10)}
            className="text-white hover:bg-white/20"
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                changeVolume(newVolume - volume);
              }}
              className="w-20"
            />
          </div>

          <div className="flex-1 text-white text-sm ml-4">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20 ml-auto"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

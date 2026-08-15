"use client";

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  volume: number; // 0 to 100
  isMuted: boolean;
  seekToTime?: number | null;
  onStateChange?: (state: number) => void;
  onSongEnded?: () => void;
  onAutoplayBlocked?: () => void;
  onReady?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  isPlaying,
  volume,
  isMuted,
  seekToTime,
  onStateChange,
  onSongEnded,
  onAutoplayBlocked,
  onReady,
  onProgress,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const isReadyRef = useRef<boolean>(false);
  const currentVideoIdRef = useRef<string>(videoId);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize Player ONCE
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const initPlayer = () => {
      if (!containerRef.current || !window.YT || !window.YT.Player || playerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            isReadyRef.current = true;
            event.target.setVolume(isMuted ? 0 : volume);
            if (isPlaying) {
              try {
                event.target.playVideo();
              } catch {
                onAutoplayBlocked?.();
              }
            }
            onReady?.();
          },
          onStateChange: (event: any) => {
            onStateChange?.(event.data);
            if (event.data === 0) {
              // Track ended -> auto advance to next
              onSongEnded?.();
            }
          },
          onError: (event: any) => {
            console.warn("YouTube player error (code " + event.data + ") for video:", videoId);
            setTimeout(() => {
              onSongEnded?.();
            }, 1200);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          initPlayer();
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // Poll progress (current time & duration)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef.current && isReadyRef.current) {
        try {
          const current = playerRef.current.getCurrentTime() || 0;
          const total = playerRef.current.getDuration() || 0;
          onProgress?.(current, total);
        } catch {
          // ignore
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, onProgress]);

  // Handle SeekTo changes
  useEffect(() => {
    if (seekToTime !== null && seekToTime !== undefined && playerRef.current && isReadyRef.current) {
      try {
        playerRef.current.seekTo(seekToTime, true);
      } catch (e) {
        console.warn("SeekTo error:", e);
      }
    }
  }, [seekToTime]);

  // Handle Video ID Changes smoothly without destroying player
  useEffect(() => {
    if (!playerRef.current || !isReadyRef.current) return;
    if (currentVideoIdRef.current === videoId) return;

    currentVideoIdRef.current = videoId;
    try {
      if (isPlaying) {
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current.cueVideoById(videoId);
      }
    } catch (e) {
      console.warn("Error changing video ID:", e);
    }
  }, [videoId, isPlaying]);

  // Sync Play / Pause state
  useEffect(() => {
    if (!playerRef.current || !isReadyRef.current) return;
    try {
      const state = playerRef.current.getPlayerState();
      if (isPlaying && state !== 1 && state !== 3) {
        playerRef.current.playVideo();
      } else if (!isPlaying && state === 1) {
        playerRef.current.pauseVideo();
      }
    } catch {
      if (isPlaying) onAutoplayBlocked?.();
    }
  }, [isPlaying]);

  // Sync Volume & Muted state
  useEffect(() => {
    if (!playerRef.current || !isReadyRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
    } catch (e) {
      console.warn("Volume sync error:", e);
    }
  }, [volume, isMuted]);

  return (
    <div className="fixed -bottom-[9999px] -right-[9999px] h-1 w-1 opacity-0 pointer-events-none aria-hidden">
      <div ref={containerRef} />
    </div>
  );
};

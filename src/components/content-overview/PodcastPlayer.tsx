import React, { useEffect, useRef, useState } from "react";
import { Button, Slider } from "@volksverpetzer/ui-web";

interface PodcastPlayerProps {
  src: string;
  /** Pause playback, e.g. while the banner animates the player closed. */
  stopped?: boolean;
  onEnded?: () => void;
}

const formatTime = (time: number) => {
  if (!Number.isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

/**
 * Custom audio player for the startpage podcast banner, mirroring the
 * player on audio.volksverpetzer.de (vvp_wp_audio_converter's
 * components/audio-player.tsx): a round play/pause button next to a ui-web
 * Slider with elapsed/total time underneath, instead of the browser's
 * native <audio controls>. It's only mounted after "Anhören" is clicked,
 * so it starts playback right away; unmounting it (Schließen, or another
 * banner starting) stops the audio.
 */
export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  src,
  stopped = false,
  onEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => {
      // Autoplay can be refused (e.g. no user activation reached the
      // audio element); leave it paused so the play button still works.
      setIsLoading(false);
    });
  }, [src]);

  useEffect(() => {
    if (stopped) audioRef.current?.pause();
  }, [stopped]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsLoading(false);
      }
    } else {
      audio.pause();
    }
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <div className="vvp-co__podcast-player">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="vvp-co__podcast-player-audio"
        onPlay={() => setIsPlaying(true)}
        onPlaying={() => setIsLoading(false)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
      />
      <Button
        size="lg"
        onClick={togglePlayPause}
        className="vvp-co__podcast-player-btn"
        aria-label={isPlaying ? "Pause" : "Abspielen"}
      >
        {isLoading && isPlaying ? (
          <span className="vvp-co__podcast-player-spinner" />
        ) : isPlaying ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </Button>
      <div className="vvp-co__podcast-player-meta">
        <Slider
          value={currentTime}
          max={Number.isFinite(duration) && duration > 0 ? duration : 100}
          step={0.1}
          onValueChange={handleSeek}
          disabled={!(duration > 0)}
          aria-label="Wiedergabeposition"
        />
        <div className="vvp-co__podcast-player-times">
          <span className="vvp-co__podcast-player-time">
            {formatTime(currentTime)}
          </span>
          <span className="vvp-co__podcast-player-time">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

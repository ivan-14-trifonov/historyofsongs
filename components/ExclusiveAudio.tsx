'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';

interface ExclusiveAudioProps {
  src: string;
  children?: ReactNode;
}

export default function ExclusiveAudio({ src, children }: ExclusiveAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  function pauseOtherAudio() {
    document.querySelectorAll('audio').forEach((audio) => {
      if (audio !== audioRef.current) {
        audio.pause();
      }
    });
  }

  return (
    <audio
      ref={audioRef}
      controls
      preload="metadata"
      src={src}
      onPlay={pauseOtherAudio}
    >
      {children}
    </audio>
  );
}

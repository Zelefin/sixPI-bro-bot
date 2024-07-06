import { useRef, useEffect } from 'react';

function useAudio(url: string) {
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audio.current = new Audio(url);
    return () => {
      if (audio.current) {
        audio.current.pause();
        audio.current = null;
      }
    };
  }, [url]);

  return audio;
}

export default useAudio;
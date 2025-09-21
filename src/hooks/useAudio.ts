import { useCallback, useEffect } from "react";
import { audioManager } from "../utils/AudioManager";

export const useAudio = () => {
  useEffect(() => {
    // BGM disabled - user will add custom music
    // Only initialize the audio context for sound effects
    return () => {
      audioManager.stopBackgroundMusic();
    };
  }, []);

  const playButtonClick = useCallback(() => {
    audioManager.playButtonClick();
  }, []);

  const playButtonHover = useCallback(() => {
    audioManager.playButtonHover();
  }, []);

  const playTodoAdd = useCallback(() => {
    audioManager.playTodoAdd();
  }, []);

  const playTodoComplete = useCallback(() => {
    audioManager.playTodoComplete();
  }, []);

  const playTodoDelete = useCallback(() => {
    audioManager.playTodoDelete();
  }, []);

  const playWindowOpen = useCallback(() => {
    audioManager.playWindowOpen();
  }, []);

  const playWindowClose = useCallback(() => {
    audioManager.playWindowClose();
  }, []);

  const toggleMute = useCallback(() => {
    return audioManager.toggleMute();
  }, []);

  const toggleBgmMute = useCallback(() => {
    return audioManager.toggleBgmMute();
  }, []);

  const toggleSfxMute = useCallback(() => {
    return audioManager.toggleSfxMute();
  }, []);

  const setBgmVolume = useCallback((volume: number) => {
    audioManager.setBgmVolume(volume);
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    audioManager.setSfxVolume(volume);
  }, []);

  const loadCustomBgm = useCallback(async (audioFile: File | string) => {
    return audioManager.loadAndPlayCustomBgm(audioFile);
  }, []);

  return {
    playButtonClick,
    playButtonHover,
    playTodoAdd,
    playTodoComplete,
    playTodoDelete,
    playWindowOpen,
    playWindowClose,
    toggleMute,
    toggleBgmMute,
    toggleSfxMute,
    setBgmVolume,
    setSfxVolume,
    loadCustomBgm,
    isMuted: audioManager.isMutedState(),
    isBgmMuted: audioManager.isBgmMutedState(),
    isSfxMuted: audioManager.isSfxMutedState(),
  };
};

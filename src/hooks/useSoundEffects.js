import useSound from 'use-sound';

const useSoundEffects = () => {
  // 1. We use online URLs for testing so it works immediately.
  //    Later, you can download mp3s and put them in your public/sounds/ folder.
  
  // Hover: A futuristic high-tech beep
  const hoverUrl = 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3';
  
  // Click: A mechanical switch sound
  const clickUrl = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';

  const [playHover] = useSound(hoverUrl, { volume: 0.2 });
  const [playClick] = useSound(clickUrl, { volume: 0.5 });

  // Wrapper functions to help debug
  const safePlayHover = () => {
    // Browsers block audio until the user interacts (clicks) with the page at least once.
    console.log("🔊 Hover Sound Triggered");
    playHover();
  };

  const safePlayClick = () => {
    console.log("🔊 Click Sound Triggered");
    playClick();
  };

  return { 
    playHover: safePlayHover, 
    playClick: safePlayClick 
  };
};

export default useSoundEffects;
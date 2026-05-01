import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bone, Music, Star, Zap, Mic, MicOff } from 'lucide-react';
import { playCrunchSound, playTrickSound, playConcertSound } from './utils/audio';
import { useLiveAPI } from './hooks/useLiveAPI';

const TRICKS = [
  { name: 'Spin', animation: { rotate: 360 }, duration: 0.6 },
  { name: 'Jump', animation: { y: [0, -60, 0] }, duration: 0.5 },
  { name: 'Shake', animation: { x: [0, -20, 20, -20, 20, 0] }, duration: 0.5 },
  { name: 'Moonwalk', animation: { x: [0, -80, 80, 0] }, duration: 1.2 },
  { name: 'Bow', animation: { rotateX: [0, 45, 0], y: [0, 20, 0] }, duration: 0.8 },
  { name: 'All Shook Up', animation: { rotate: [0, -15, 15, -15, 15, 0], scale: [1, 1.1, 1] }, duration: 0.6 }
];

const QUOTES = [
  "Thank you, thank you very much! 🕺",
  "You ain't nothin' but a hound dog! 🐕",
  "A little less conversation, a little more action please! 🎸",
  "Wise men say... only fools rush in to eat all the treats! 🥜",
  "Uh-huh-huh! 🕶️",
  "Don't be cruel... give me another treat! 🥺",
  "I'm all shook up! 🫨",
  "Viva Las Vegas! 🎲",
  "Love me tender, love me sweet, never let me go... without a treat! 🎶",
  "Return to sender... wait, no, send more treats! 📦",
  "I forgot to remember to forget... how good these treats are! 🤤",
  "It's now or never... feed me! 🍖"
];

const CONCERT_QUOTES = [
  "LADIES AND GENTLEMEN, ELVIS HAS LEFT THE BUILDING! 🎤💥",
  "WE'RE CAUGHT IN A TRAP... OF DELICIOUSNESS! 🕺✨",
  "BLUE SUEDE PAWS, BABY! 🎸🔥"
];

// Available female voices
const VOICES = ['Kore', 'Zephyr'];

export default function App() {
  const [treatsFed, setTreatsFed] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [currentQuote, setCurrentQuote] = useState("Well, it's one for the money, two for the show... feed me a treat and watch me go! 🎸");
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState({});
  const [concertMode, setConcertMode] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Zephyr");
  
  // Audio configuration state
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [tone, setTone] = useState(0);
  
  const { isConnected, isConnecting, isSpeaking, connect, disconnect, setAudioConfig } = useLiveAPI();

  // Update audio config whenever sliders change
  useEffect(() => {
    if (setAudioConfig) {
      setAudioConfig(speed, pitch, tone);
    }
  }, [speed, pitch, tone, setAudioConfig]);

  const feedTreat = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTreatsFed(prev => prev + 1);
    
    playCrunchSound();
    
    const newEnergy = Math.min(energy + 15, 100);
    setEnergy(newEnergy);

    if (newEnergy === 100 && !concertMode) {
      setTimeout(() => {
        triggerConcertMode();
      }, 200);
    } else {
      setTimeout(() => {
        const randomTrick = TRICKS[Math.floor(Math.random() * TRICKS.length)];
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        
        setCurrentQuote(randomQuote);
        setCurrentAnimation({
          ...randomTrick.animation,
          transition: { duration: randomTrick.duration, ease: "easeInOut" }
        });
        setShowNotes(true);
        playTrickSound();
      }, 200);
    }
  };

  const triggerConcertMode = () => {
    setConcertMode(true);
    setCurrentQuote(CONCERT_QUOTES[Math.floor(Math.random() * CONCERT_QUOTES.length)]);
    setCurrentAnimation({
      y: [0, -40, 0, -40, 0],
      rotate: [0, -10, 10, -10, 10, 0],
      scale: [1, 1.2, 1.2, 1.2, 1],
      transition: { duration: 2, ease: "easeInOut" }
    });
    setShowNotes(true);
    playConcertSound();
    
    setTimeout(() => {
      setEnergy(0);
      setConcertMode(false);
      setCurrentQuote("Phew, what a show! I need a peanut butter and banana sandwich... or just a treat. 🥪");
    }, 4000);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setCurrentAnimation({});
    setShowNotes(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-amber-500/30">
      {/* Stage Background */}
      <div className="absolute inset-0 flex justify-between pointer-events-none z-0 opacity-80">
        <div className="w-1/4 h-full bg-red-900 shadow-[20px_0_50px_rgba(0,0,0,0.8)] border-r-8 border-red-950 transform -skew-x-2" />
        <div className="w-1/4 h-full bg-red-900 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] border-l-8 border-red-950 transform skew-x-2" />
      </div>
      
      {/* Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[800px] bg-gradient-to-b from-amber-200/20 via-amber-200/5 to-transparent pointer-events-none z-0 rounded-full blur-3xl" />
      
      {/* Concert Mode Effects */}
      <AnimatePresence>
        {concertMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-indigo-900/30 mix-blend-color-dodge animate-pulse" />
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: "100vh", x: 0, opacity: 1 }}
                animate={{ 
                  y: "-20vh", 
                  x: (Math.random() - 0.5) * 400,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "linear" }}
                className="absolute text-amber-400"
                style={{ left: `${10 + Math.random() * 80}%` }}
              >
                <Star size={24 + Math.random() * 24} fill="currentColor" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 w-full max-w-2xl mx-auto px-4 flex flex-col items-center">
        
        {/* Header / Stats */}
        <div className="w-full flex items-center justify-between mb-8 bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-2 rounded-xl">
              <Bone className="text-amber-500" size={24} />
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Treats Fed</p>
              <p className="text-2xl font-black text-white">{treatsFed}</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-xs ml-8">
            <div className="flex justify-between items-end mb-1">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-1">
                <Zap size={12} className="text-amber-400" /> Rock & Roll Energy
              </p>
              <p className="text-xs font-bold text-amber-400">{energy}%</p>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${energy}%` }}
                transition={{ type: "spring", bounce: 0.2 }}
              />
            </div>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="h-32 flex items-end justify-center mb-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="relative bg-white text-zinc-900 px-6 py-4 rounded-3xl shadow-2xl max-w-md text-center"
            >
              <p className="text-lg font-medium leading-snug">{currentQuote}</p>
              {/* Bubble Tail */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white transform rotate-45" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Character Stage */}
        <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
          {/* Floor shadow */}
          <div className="absolute -bottom-8 w-48 h-12 bg-black/40 rounded-[100%] blur-md" />
          
          {/* Floating Notes */}
          <AnimatePresence>
            {showNotes && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 0, x: -20 }}
                  animate={{ opacity: 1, y: -100, x: -60, rotate: -20 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute top-10 left-0 text-amber-400 z-30"
                >
                  <Music size={32} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 0, x: 20 }}
                  animate={{ opacity: 1, y: -120, x: 60, rotate: 20 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.1 }}
                  className="absolute top-10 right-0 text-pink-400 z-30"
                >
                  <Music size={24} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* The Bulldog */}
          <motion.div
            animate={currentAnimation}
            onAnimationComplete={handleAnimationComplete}
            className="relative w-full h-full z-20 origin-bottom"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl overflow-visible">
              {/* Cape */}
              <path d="M 40 100 Q 10 180 30 210 L 170 210 Q 190 180 160 100 Z" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" />
              <path d="M 40 100 Q 100 130 160 100" fill="none" stroke="#fbbf24" strokeWidth="6" />
              
              {/* Body/Chest */}
              <circle cx="100" cy="140" r="45" fill="#d4a373" />
              <path d="M 80 140 Q 100 180 120 140" fill="none" stroke="#ffffff" strokeWidth="20" strokeLinecap="round" opacity="0.8" />
              
              {/* Collar */}
              <path d="M 60 110 Q 100 135 140 110" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" />
              <circle cx="80" cy="118" r="3" fill="#fbbf24" />
              <circle cx="100" cy="122" r="3" fill="#fbbf24" />
              <circle cx="120" cy="118" r="3" fill="#fbbf24" />

              {/* Head base */}
              <circle cx="100" cy="80" r="42" fill="#d4a373" />
              
              {/* Jowls */}
              <circle cx="75" cy="98" r="22" fill="#faedcd" />
              <circle cx="125" cy="98" r="22" fill="#faedcd" />
              
              {/* Nose */}
              <ellipse cx="100" cy="88" rx="14" ry="9" fill="#292524" />
              <path d="M 95 85 Q 100 82 105 85" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              
              {/* Mouth */}
              <motion.path 
                d="M 85 105 Q 100 115 115 105" 
                fill="none" 
                stroke="#292524" 
                strokeWidth="3" 
                strokeLinecap="round" 
                animate={isSpeaking ? { d: ["M 85 105 Q 100 115 115 105", "M 85 105 Q 100 125 115 105", "M 85 105 Q 100 115 115 105"] } : {}}
                transition={{ repeat: Infinity, duration: 0.3 }}
              />
              <motion.path 
                d="M 100 110 L 100 115" 
                stroke="#292524" 
                strokeWidth="3" 
                animate={isSpeaking ? { y: [0, 5, 0] } : {}}
                transition={{ repeat: Infinity, duration: 0.3 }}
              />
              
              {/* Ears */}
              <path d="M 62 55 Q 30 35 45 85 Z" fill="#d4a373" />
              <path d="M 138 55 Q 170 35 155 85 Z" fill="#d4a373" />
              <path d="M 62 55 Q 40 45 50 75 Z" fill="#292524" opacity="0.1" />
              <path d="M 138 55 Q 160 45 150 75 Z" fill="#292524" opacity="0.1" />
              
              {/* Sunglasses (Aviators) */}
              <path d="M 50 70 Q 75 60 95 70 Q 95 90 70 90 Q 50 90 50 70 Z" fill="#1c1917" />
              <path d="M 105 70 Q 125 60 150 70 Q 150 90 130 90 Q 105 90 105 70 Z" fill="#1c1917" />
              <path d="M 95 72 L 105 72" stroke="#1c1917" strokeWidth="4" />
              <path d="M 50 70 L 40 60" stroke="#1c1917" strokeWidth="4" />
              <path d="M 150 70 L 160 60" stroke="#1c1917" strokeWidth="4" />
              
              {/* Sunglasses reflection */}
              <path d="M 55 72 L 85 72" stroke="#ffffff" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
              <path d="M 110 72 L 140 72" stroke="#ffffff" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
              
              {/* Pompadour Hair */}
              <path d="M 55 55 Q 100 -10 145 55 Q 120 15 100 25 Q 80 15 55 55 Z" fill="#1c1917" />
              <path d="M 75 35 Q 100 -5 135 45 Q 110 15 75 35 Z" fill="#292524" />
              <path d="M 85 25 Q 100 5 120 30" fill="none" stroke="#44403c" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={feedTreat}
            disabled={isAnimating}
            className={`
              relative group overflow-hidden rounded-full px-8 py-4 font-bold text-lg shadow-2xl
              transition-all duration-300 flex items-center gap-3
              ${isAnimating 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-amber-500/25'}
            `}
          >
            {/* Button Shine Effect */}
            {!isAnimating && (
              <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            )}
            
            <Bone size={24} className={isAnimating ? '' : 'animate-bounce'} />
            <span>{isAnimating ? 'Doing Trick...' : 'Feed Treat'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isConnected ? disconnect : () => connect(selectedVoice)}
            disabled={isConnecting}
            className={`
              relative overflow-hidden rounded-full px-6 py-3 font-bold text-sm shadow-xl
              transition-all duration-300 flex items-center gap-2
              ${isConnected 
                ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' 
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'}
            `}
          >
            {isConnected ? <MicOff size={18} /> : <Mic size={18} />}
            <span>{isConnecting ? 'Connecting...' : isConnected ? 'Stop Talking' : 'Talk to Elvis'}</span>
          </motion.button>

          {/* Audio Controls - Always visible now */}
          <div className="w-full max-w-xs bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col gap-4">
            
            {/* Voice Selector (Only when disconnected) */}
            {!isConnected && !isConnecting && (
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-2">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Voice</span>
                <select 
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2 py-1 rounded focus:outline-none cursor-pointer border border-zinc-700"
                >
                  {VOICES.map(voice => (
                    <option key={voice} value={voice} className="bg-zinc-900 text-zinc-300">
                      {voice}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speed Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-500 font-medium">
                <span>Speed</span>
                <span>{speed.toFixed(1)}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={speed} 
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Pitch Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-500 font-medium">
                <span>Pitch</span>
                <span>{pitch > 0 ? '+' : ''}{pitch}</span>
              </div>
              <input 
                type="range" 
                min="-1200" 
                max="1200" 
                step="100" 
                value={pitch} 
                onChange={(e) => setPitch(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Tone Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-500 font-medium">
                <span>Tone</span>
                <span>{tone > 0 ? '+' : ''}{tone}dB</span>
              </div>
              <input 
                type="range" 
                min="-20" 
                max="20" 
                step="1" 
                value={tone} 
                onChange={(e) => setTone(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

          </div>
        </div>
        
        <p className="mt-6 text-zinc-500 text-sm font-medium">
          Feed treats to fill the Rock & Roll Energy meter!
        </p>

      </div>
    </div>
  );
}

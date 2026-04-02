import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import pipImage from '@/assets/mindling-pip.png';
import miraImage from '@/assets/mindling-mira.png';
import veeImage from '@/assets/mindling-vee.png';
import nuoImage from '@/assets/mindling-nuo.png';

const mascots = [pipImage, miraImage, veeImage, nuoImage];

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeMascot, setActiveMascot] = useState(0);
  const navigate = useNavigate();

  // Cycle mascot on focus
  const cycleMascot = () => setActiveMascot((prev) => (prev + 1) % mascots.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to game
    navigate('/game');
  };

  return (
    <div className="min-h-screen w-full gradient-sky relative overflow-hidden flex items-center justify-center px-4">
      {/* Floating background particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${8 + Math.random() * 16}px`,
            height: `${8 + Math.random() * 16}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, hsl(${[45, 170, 280, 15][i % 4]} 60% 75% / 0.4) 0%, transparent 70%)`,
          }}
          animate={{
            y: [0, -(15 + Math.random() * 25), 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Floating clouds */}
      <motion.div
        className="absolute top-16 left-8 w-28 h-12 bg-cloud-white/70 rounded-full blur-sm"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-32 right-12 w-36 h-14 bg-cloud-white/50 rounded-full blur-sm"
        animate={{ x: [0, -25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main card */}
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Mascot peeping from top */}
        <motion.div
          className="flex justify-center -mb-6 relative z-20"
          key={activeMascot}
          initial={{ y: 20, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, hsl(200, 80%, 90%) 0%, hsl(210, 70%, 85%) 100%)',
              boxShadow: '0 4px 16px hsla(220, 50%, 50%, 0.2)',
            }}
          >
            <motion.img
              src={mascots[activeMascot]}
              alt="Mindling mascot"
              className="w-16 h-16 object-contain"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        {/* Card */}
        <div
          className="rounded-game overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.92) 0%, hsl(210 40% 98% / 0.88) 100%)',
            boxShadow: '0 12px 40px -8px hsl(220 50% 50% / 0.2), 0 4px 12px hsl(220 40% 60% / 0.1)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Decorative top gradient bar */}
          <div
            className="h-1.5"
            style={{
              background: 'linear-gradient(90deg, hsl(45, 95%, 55%), hsl(15, 85%, 70%), hsl(280, 60%, 60%), hsl(170, 50%, 70%))',
            }}
          />

          <div className="px-8 pt-8 pb-6">
            {/* Title */}
            <h1 className="game-title text-3xl text-center text-foreground mb-1">
              {isSignup ? 'Join the Adventure!' : 'Welcome Back!'}
            </h1>
            <p className="text-center text-muted-foreground font-display text-sm mb-6">
              {isSignup ? 'Create your explorer account' : 'Your Mindlings are waiting for you'}
            </p>

            {/* Tab toggle */}
            <div className="flex bg-muted rounded-bubble p-1 mb-6">
              <button
                onClick={() => setIsSignup(false)}
                className={`flex-1 py-2.5 rounded-bubble font-display font-bold text-sm transition-all duration-300
                  ${!isSignup
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Log In
              </button>
              <button
                onClick={() => setIsSignup(true)}
                className={`flex-1 py-2.5 rounded-bubble font-display font-bold text-sm transition-all duration-300
                  ${isSignup
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-display font-bold text-sm text-foreground mb-1.5">
                  Explorer Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={cycleMascot}
                  placeholder="Enter your name..."
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-game bg-muted/60 border-2 border-border
                             font-display text-base text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:border-primary focus:bg-card
                             transition-all duration-200"
                />
              </div>

              <AnimatePresence>
                {isSignup && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <label className="block font-display font-bold text-sm text-foreground mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      onFocus={cycleMascot}
                      placeholder="How old are you?"
                      min={3}
                      max={120}
                      className="w-full px-4 py-3 rounded-game bg-muted/60 border-2 border-border
                                 font-display text-base text-foreground placeholder:text-muted-foreground
                                 focus:outline-none focus:border-primary focus:bg-card
                                 transition-all duration-200"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block font-display font-bold text-sm text-foreground mb-1.5">
                  Secret Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={cycleMascot}
                  placeholder="Shhh... it's a secret!"
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-game bg-muted/60 border-2 border-border
                             font-display text-base text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:border-primary focus:bg-card
                             transition-all duration-200"
                />
              </div>

              <AnimatePresence>
                {isSignup && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <label className="block font-display font-bold text-sm text-foreground mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={cycleMascot}
                      placeholder="Type it again!"
                      maxLength={50}
                      className="w-full px-4 py-3 rounded-game bg-muted/60 border-2 border-border
                                 font-display text-base text-foreground placeholder:text-muted-foreground
                                 focus:outline-none focus:border-primary focus:bg-card
                                 transition-all duration-200"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-game font-display font-bold text-lg
                           text-primary-foreground transition-all duration-200"
                style={{
                  background: 'linear-gradient(180deg, hsl(45, 95%, 60%) 0%, hsl(40, 90%, 48%) 100%)',
                  boxShadow: '0 4px 20px hsl(45, 100%, 50% / 0.4), inset 0 1px 0 hsl(50, 100%, 75% / 0.5)',
                }}
              >
                {isSignup ? 'Start My Adventure!' : 'Let\'s Go!'}
              </motion.button>
            </form>
          </div>

          {/* Bottom decorative mascots */}
          <div className="flex justify-center gap-3 pb-5">
            {mascots.map((img, i) => (
              <motion.img
                key={i}
                src={img}
                alt=""
                className="w-8 h-8 object-contain"
                style={{ filter: 'drop-shadow(0 2px 4px hsla(45, 100%, 60%, 0.3))', opacity: i === activeMascot ? 1 : 0.35 }}
                animate={i === activeMascot ? { y: [0, -4, 0] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

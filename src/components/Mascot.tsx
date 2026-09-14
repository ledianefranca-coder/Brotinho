import { motion } from 'motion/react';
import { MascotMood, MascotStatus } from '../types.ts';

interface MascotProps {
  status: MascotStatus;
  size?: 'sm' | 'md' | 'lg';
  showSpeechBubble?: boolean;
  onMascotClick?: () => void;
}

export function MascotSvg({ 
  status, 
  className = "w-full h-full drop-shadow-sm" 
}: { 
  status: MascotStatus; 
  className?: string;
}) {
  const getEyeExpression = () => {
    switch (status.mood) {
      case 'overdue':
        // Worried eyes with slight tilt
        return (
          <g>
            <ellipse cx="38" cy="46" rx="3.5" ry="4.5" fill="#1e293b" />
            <ellipse cx="62" cy="46" rx="3.5" ry="4.5" fill="#1e293b" />
            <circle cx="39.5" cy="44.5" r="1.2" fill="#ffffff" />
            <circle cx="63.5" cy="44.5" r="1.2" fill="#ffffff" />
            {/* Worried eyebrows */}
            <path d="M 33 39 Q 39 42 43 41" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 67 39 Q 61 42 57 41" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Worried wavy mouth */}
            <path d="M 43 56 Q 50 52 57 56" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'upcoming_due':
        // Alert / watchful eyes looking sideways
        return (
          <g>
            <ellipse cx="40" cy="45" rx="4" ry="4.5" fill="#1e293b" />
            <ellipse cx="64" cy="45" rx="4" ry="4.5" fill="#1e293b" />
            <circle cx="42" cy="43.5" r="1.5" fill="#ffffff" />
            <circle cx="66" cy="43.5" r="1.5" fill="#ffffff" />
            {/* Observant curved mouth (small 'o') */}
            <ellipse cx="50" cy="55" rx="3" ry="2.5" fill="#1e293b" />
          </g>
        );
      case 'in_control':
        // Relaxed, serene, zen smiling curved eyes
        return (
          <g>
            <path d="M 33 46 Q 39 40 45 46" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 55 46 Q 61 40 67 46" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Peaceful sweet smile */}
            <path d="M 43 54 Q 50 60 57 54" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'month_completed':
        // Happy celebratory winking or star eyes
        return (
          <g>
            {/* Left eye winking/curved */}
            <path d="M 33 46 Q 39 39 45 46" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            {/* Right eye big happy twinkle */}
            <circle cx="62" cy="45" r="5" fill="#1e293b" />
            <circle cx="60" cy="43" r="1.8" fill="#ffffff" />
            {/* Big open joy mouth */}
            <path d="M 42 53 Q 50 64 58 53 Z" fill="#e11d48" stroke="#be123c" strokeWidth="1" />
            <path d="M 45 56 Q 50 61 55 56" fill="#fda4af" />
          </g>
        );
      case 'all_good':
      default:
        // Gentle happy smiling eyes
        return (
          <g>
            <ellipse cx="38" cy="45" rx="3.8" ry="4.8" fill="#1e293b" />
            <ellipse cx="62" cy="45" rx="3.8" ry="4.8" fill="#1e293b" />
            <circle cx="36.5" cy="43" r="1.5" fill="#ffffff" />
            <circle cx="60.5" cy="43" r="1.5" fill="#ffffff" />
            {/* Gentle smile */}
            <path d="M 43 54 Q 50 61 57 54" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        );
    }
  };

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Subtle glow / shadow */}
      <ellipse cx="50" cy="88" rx="28" ry="6" fill="#94a3b8" fillOpacity="0.25" />

      {/* Plant Pot / Vasinho Moderno Terracota Suave */}
      <path
        d="M 28 60 L 33 84 Q 34 87 38 87 L 62 87 Q 66 87 67 84 L 72 60 Z"
        fill="#f97316"
        className="fill-orange-400"
      />
      {/* Pot Rim */}
      <rect x="25" y="55" width="50" height="7" rx="3.5" fill="#ea580c" className="fill-orange-500" />
      
      {/* Pot detail: cute golden coin symbol on pot */}
      <circle cx="50" cy="73" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
      <text x="50" y="76" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#854d0e">R$</text>

      {/* Plant Stem */}
      <path d="M 50 56 Q 50 40 50 32" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />

      {/* Little green sprout head / leaf base */}
      <circle cx="50" cy="48" r="22" fill="#4ade80" />
      {/* Soft cheek blushes */}
      <ellipse cx="34" cy="51" rx="4" ry="2" fill="#f43f5e" fillOpacity="0.35" />
      <ellipse cx="66" cy="51" rx="4" ry="2" fill="#f43f5e" fillOpacity="0.35" />

      {/* Cute leaves sprouting from top head */}
      {/* Left Leaf */}
      <motion.path 
        animate={{ rotate: status.mood === 'overdue' ? [-2, 2, -2] : [0, 4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '48px 28px' }}
        d="M 50 28 C 36 20 32 10 44 8 C 50 14 50 22 50 28 Z" 
        fill="#22c55e" 
      />
      {/* Right Leaf */}
      <motion.path 
        animate={{ rotate: status.mood === 'month_completed' ? [-4, 6, -4] : [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '52px 28px' }}
        d="M 50 28 C 64 20 68 10 56 8 C 50 14 50 22 50 28 Z" 
        fill="#16a34a" 
      />

      {/* Golden sprout coin bud at center */}
      <circle cx="50" cy="18" r="4.5" fill="#facc15" stroke="#eab308" strokeWidth="1" />
      <path d="M 48 18 L 52 18" stroke="#713f12" strokeWidth="1" strokeLinecap="round" />

      {/* Expression (Eyes & Mouth) */}
      {getEyeExpression()}
    </svg>
  );
}

export function Mascot({ status, size = 'md', showSpeechBubble = true, onMascotClick }: MascotProps) {

  const getMoodColorBg = () => {
    switch (status.mood) {
      case 'overdue':
        return 'from-rose-50 to-amber-50/50 border-rose-200/80 text-rose-900';
      case 'upcoming_due':
        return 'from-amber-50 to-orange-50/40 border-amber-200 text-amber-900';
      case 'in_control':
        return 'from-teal-50 to-emerald-50/60 border-teal-200/70 text-teal-900';
      case 'month_completed':
        return 'from-emerald-50 via-teal-50 to-purple-50/40 border-emerald-300 text-emerald-950';
      case 'all_good':
      default:
        return 'from-emerald-50 to-teal-50/50 border-emerald-200/70 text-emerald-900';
    }
  };

  const dimensions = {
    sm: { w: 48, h: 48, scale: 'w-12 h-12' },
    md: { w: 72, h: 72, scale: 'w-18 h-18' },
    lg: { w: 96, h: 96, scale: 'w-24 h-24' }
  }[size];

  return (
    <div 
      id="mascot-widget-container"
      className={`flex items-center gap-3.5 transition-all select-none ${
        showSpeechBubble ? `p-3 sm:p-4 rounded-2xl bg-gradient-to-r ${getMoodColorBg()} border shadow-xs` : ''
      }`}
    >
      <motion.div
        id="mascot-avatar-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMascotClick}
        className={`relative shrink-0 cursor-pointer ${dimensions.scale}`}
        title="Brotinho Financeiro - Seu companheiro de finanças"
      >
        <MascotSvg status={status} />

        {/* Small floating badge status */}
        <span className="absolute -bottom-1 -right-1 text-sm select-none">
          {status.emoji}
        </span>
      </motion.div>

      {showSpeechBubble && (
        <div id="mascot-speech-bubble" className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-semibold text-sm">
            <span className="truncate">{status.title}</span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
            {status.message}
          </p>
        </div>
      )}
    </div>
  );
}

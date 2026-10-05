import styles from './SpaceBackground.module.css';

// Small deterministic PRNG so the starfield is identical on every render.
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(137);
const TWINKLE = [styles.twinkleA, styles.twinkleB, styles.twinkleC];
const ORB_FILLS = ['url(#orb-green)', 'url(#orb-cyan)', 'url(#orb-purple)'];

// Stars are split into a few groups so each group twinkles on its own rhythm
// (animating three groups is far cheaper than animating every star).
const STAR_GROUPS = TWINKLE.map((className) => ({
  className,
  stars: Array.from({ length: 48 }, () => ({
    x: random() * 1600,
    y: random() * 1000,
    r: random() < 0.85 ? 0.8 + random() * 0.9 : 1.8 + random() * 1.2,
  })),
}));

// The colorful floating "orbs" scattered around the show's posters.
const ORBS = Array.from({ length: 18 }, (_, i) => ({
  x: random() * 1600,
  y: random() * 1000,
  r: 3 + random() * 6,
  fill: ORB_FILLS[i % ORB_FILLS.length],
}));

/** Fixed, decorative deep-space backdrop: nebula glow, stars, orbs and planets. */
export default function SpaceBackground() {
  return (
    <div className={styles.space} aria-hidden="true">
      <svg className={styles.starfield} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="orb-green" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e9ffb0" />
            <stop offset="45%" stopColor="#97ce4c" />
            <stop offset="100%" stopColor="#3d6b1a" />
          </radialGradient>
          <radialGradient id="orb-cyan" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#d8fbff" />
            <stop offset="45%" stopColor="#42b4ca" />
            <stop offset="100%" stopColor="#1b4f6b" />
          </radialGradient>
          <radialGradient id="orb-purple" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e5d8ff" />
            <stop offset="45%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b1f7a" />
          </radialGradient>
        </defs>

        {STAR_GROUPS.map((group) => (
          <g key={group.className} className={group.className} fill="#ffffff">
            {group.stars.map((star, i) => (
              <circle key={i} cx={star.x} cy={star.y} r={star.r} />
            ))}
          </g>
        ))}
        {ORBS.map((orb, i) => (
          <circle key={i} className={styles.orb} cx={orb.x} cy={orb.y} r={orb.r} fill={orb.fill} />
        ))}

        {/* Tiny ringed planets, like the ones zipping past the ship on the poster */}
        <g transform="translate(1180 760) rotate(-28)">
          <circle r="16" fill="url(#orb-green)" />
          <ellipse rx="34" ry="7" fill="none" stroke="#5b6cf0" strokeWidth="4" />
          <path d="M-16 0a16 16 0 0 0 32 0" fill="url(#orb-green)" />
        </g>
        <g transform="translate(260 300) rotate(32)">
          <circle r="11" fill="url(#orb-cyan)" />
          <ellipse rx="25" ry="5" fill="none" stroke="#8b5cf6" strokeWidth="3" />
          <path d="M-11 0a11 11 0 0 0 22 0" fill="url(#orb-cyan)" />
        </g>
      </svg>

      {/* Big swirly green planet peeking in from the bottom-left */}
      <svg className={styles.greenPlanet} viewBox="0 0 400 400">
        <defs>
          <radialGradient id="green-planet" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#7be36a" />
            <stop offset="60%" stopColor="#2e9a4a" />
            <stop offset="100%" stopColor="#11452c" />
          </radialGradient>
          <clipPath id="green-planet-clip">
            <circle cx="200" cy="200" r="190" />
          </clipPath>
        </defs>
        <circle cx="200" cy="200" r="190" fill="url(#green-planet)" />
        <g clipPath="url(#green-planet-clip)" fill="none" strokeLinecap="round">
          <path d="M-10 120c60-30 120 20 190-10s130-40 230 10" stroke="#1d7a3c" strokeWidth="22" />
          <path d="M-10 200c80-25 140 25 210-5s120-30 210 5" stroke="#5fd06a" strokeWidth="14" opacity="0.7" />
          <path d="M-10 280c70-20 130 30 200 0s140-35 220 10" stroke="#1d7a3c" strokeWidth="26" />
          <path d="M20 340c60-15 120 15 180-5s110-20 170 0" stroke="#4fc160" strokeWidth="12" opacity="0.6" />
        </g>
        <circle cx="200" cy="200" r="190" fill="none" stroke="#a6f08a" strokeWidth="3" opacity="0.5" />
      </svg>

      {/* Rainbow-ringed planet, top right */}
      <svg className={styles.ringPlanet} viewBox="0 0 300 200">
        <defs>
          <radialGradient id="ring-planet" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#9fb4ff" />
            <stop offset="55%" stopColor="#4a4fc4" />
            <stop offset="100%" stopColor="#1d1660" />
          </radialGradient>
        </defs>
        <g transform="rotate(-18 150 100)" fill="none" strokeLinecap="round">
          <ellipse cx="150" cy="100" rx="138" ry="30" stroke="#d64fc9" strokeWidth="7" opacity="0.9" />
          <ellipse cx="150" cy="100" rx="124" ry="25" stroke="#f6a23c" strokeWidth="6" opacity="0.9" />
          <ellipse cx="150" cy="100" rx="111" ry="20" stroke="#f5d742" strokeWidth="5" opacity="0.9" />
        </g>
        <circle cx="150" cy="100" r="62" fill="url(#ring-planet)" />
        <path
          d="M90 92c30 10 80 12 120 0M95 116c25 8 70 8 108-2"
          stroke="#7d8cff"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Front half of the rings passes over the planet */}
        <g transform="rotate(-18 150 100)" fill="none" strokeLinecap="round">
          <path d="M12 100a138 30 0 0 0 276 0" stroke="#d64fc9" strokeWidth="7" opacity="0.9" />
          <path d="M26 100a124 25 0 0 0 248 0" stroke="#f6a23c" strokeWidth="6" opacity="0.9" />
          <path d="M39 100a111 20 0 0 0 222 0" stroke="#f5d742" strokeWidth="5" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
}

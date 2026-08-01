import { motion } from "framer-motion";

export default function AnimatedLogo({ size = 42 }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.25 }}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#7B61FF" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left Stroke */}
        <motion.path
          d="M22 78V20"
          stroke="url(#grad)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Middle */}
        <motion.path
          d="M24 22L76 78"
          stroke="url(#grad)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Right */}
        <motion.path
          d="M76 78V20"
          stroke="url(#grad)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        />

        {/* Energy Sweep */}
        <motion.rect
          x="-40"
          y="45"
          width="35"
          height="4"
          rx="2"
          fill="white"
          opacity=".8"
          rotate="-35"
          animate={{ x: 160 }}
          transition={{
            repeat: Infinity,
            repeatDelay: 3,
            duration: 1.2,
          }}
        />
      </svg>
    </motion.div>
  );
}

import {
  Code2,
  GraduationCap,
  ImageIcon,
  MessageSquare,
  Video,
} from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: <MessageSquare size={18} />,
    label: "Chat",
    desc: "Conversational AI assistant",
  },
  {
    icon: <ImageIcon size={18} />,
    label: "Image Generation",
    desc: "Create visuals with AI",
  },
  {
    icon: <Code2 size={18} />,
    label: "Code Generator",
    desc: "Write & debug code instantly",
  },
  {
    icon: <Video size={18} />,
    label: "Video Scripts",
    desc: "Professional script writing",
  },
  {
    icon: <GraduationCap size={18} />,
    label: "Teacher Mode",
    desc: "Personalized AI tutor",
  },
];

interface LandingPageProps {
  onLaunch: () => void;
}

export function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#0B0F16" }}
    >
      {/* Glow orb background */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
      >
        {/* Logo */}
        <img
          src="/assets/generated/suggestive-ai-logo-transparent.dim_400x400.png"
          alt="Suggestive AI Logo"
          className="w-20 h-20 mb-6 object-contain drop-shadow-lg"
        />

        <h1
          className="text-4xl font-bold mb-2"
          style={{
            color: "#E7EAF0",
            fontFamily: "Bricolage Grotesque, sans-serif",
          }}
        >
          Suggestive AI
        </h1>
        <p className="text-base mb-10" style={{ color: "#9AA4B2" }}>
          Your all-in-one AI workspace
        </p>

        {/* Feature list */}
        <div className="w-full space-y-2 mb-10">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
              style={{ background: "#141A24", border: "1px solid #232A36" }}
            >
              <span style={{ color: "#A855F7" }}>{f.icon}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: "#E7EAF0" }}>
                  {f.label}
                </p>
                <p className="text-xs" style={{ color: "#9AA4B2" }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          type="button"
          data-ocid="landing.launch.primary_button"
          onClick={onLaunch}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-xl font-semibold text-base text-white transition-shadow"
          style={{
            background: "linear-gradient(135deg, #A855F7, #7C3AED)",
            boxShadow: "0 0 28px rgba(168,85,247,0.35)",
          }}
        >
          Launch App
        </motion.button>

        <p className="mt-8 text-xs" style={{ color: "#9AA4B2" }}>
          © {new Date().getFullYear()} Suggestive AI. All rights reserved.
        </p>
      </motion.div>
    </motion.div>
  );
}

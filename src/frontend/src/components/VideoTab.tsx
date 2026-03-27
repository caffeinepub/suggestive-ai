import { Check, Clapperboard, Copy, Loader2, Video } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { NoApiKeyBanner } from "./NoApiKeyBanner";

const STYLES = [
  "Documentary",
  "Short Film",
  "Tutorial",
  "Commercial",
  "Animation",
];

const SKELETON_WIDTHS = [
  "w-1/3",
  "w-full",
  "w-5/6",
  "w-full",
  "w-2/3",
  "w-full",
  "w-4/5",
];

interface VideoTabProps {
  apiKey: string;
  onOpenSettings: () => void;
}

export function VideoTab({ apiKey, onOpenSettings }: VideoTabProps) {
  const [concept, setConcept] = useState("");
  const [style, setStyle] = useState("Short Film");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);

  if (!apiKey) return <NoApiKeyBanner onOpenSettings={onOpenSettings} />;

  const generate = async () => {
    if (!concept.trim() || loading) return;
    setLoading(true);
    setScript("");
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `You are a professional video scriptwriter specializing in ${style} videos. Create a detailed video script/storyboard for the following concept. Include scene descriptions, dialogue, camera directions, and timing. Format with clear SCENE headings.`,
              },
              { role: "user", content: concept.trim() },
            ],
          }),
        },
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "API error");
      }
      const data = await response.json();
      setScript(data.choices[0].message.content.trim());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate script";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Script copied");
  };

  const formatScript = (text: string) => {
    return text.split("\n").map((line, i) => {
      const lineKey = `script-line-${i}`;
      const isScene = /^(SCENE|INT\.|EXT\.|ACT |CHAPTER)/i.test(line.trim());
      const isSpeaker =
        /^[A-Z][A-Z\s]+:/.test(line.trim()) && line.trim().length < 40;
      if (isScene)
        return (
          <div
            key={lineKey}
            className="text-sm font-bold mt-4 mb-1"
            style={{ color: "#A855F7" }}
          >
            {line}
          </div>
        );
      if (isSpeaker)
        return (
          <div
            key={lineKey}
            className="text-sm font-semibold mt-2"
            style={{ color: "#E7EAF0" }}
          >
            {line}
          </div>
        );
      return (
        <div
          key={lineKey}
          className="text-sm leading-relaxed"
          style={{ color: line.trim() ? "#9AA4B2" : undefined }}
        >
          {line || "\u00A0"}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-nova">
      <div className="p-6 space-y-4">
        <div>
          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: "#E7EAF0" }}
          >
            Video Script Generator
          </h2>
          <p className="text-sm" style={{ color: "#9AA4B2" }}>
            Turn your idea into a full professional video script with scenes,
            dialogue, and camera direction.
          </p>
        </div>

        <textarea
          data-ocid="video.textarea"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate();
          }}
          placeholder="A 3-minute short film about a programmer who discovers their code has become sentient..."
          rows={3}
          className="nova-input w-full px-4 py-3 rounded-xl text-sm resize-none"
        />

        <div className="flex gap-3">
          <select
            data-ocid="video.select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="nova-input px-3 py-2.5 rounded-lg text-sm"
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            data-ocid="video.primary_button"
            onClick={generate}
            disabled={!concept.trim() || loading}
            className="nova-btn-primary flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Writing...
              </>
            ) : (
              <>
                <Clapperboard size={15} /> Generate Script
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              data-ocid="video.loading_state"
              className="space-y-3"
            >
              {SKELETON_WIDTHS.map((w) => (
                <div key={w} className={`skeleton-nova h-4 ${w}`} />
              ))}
            </motion.div>
          )}
          {script && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #232A36" }}
              data-ocid="video.card"
            >
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{
                  background: "#0B0F16",
                  borderBottom: "1px solid #232A36",
                }}
              >
                <div className="flex items-center gap-2">
                  <Video size={14} style={{ color: "#A855F7" }} />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#9AA4B2" }}
                  >
                    {style} Script
                  </span>
                </div>
                <button
                  type="button"
                  data-ocid="video.secondary_button"
                  onClick={copy}
                  className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg transition-all"
                  style={{
                    background: "#141A24",
                    border: "1px solid #232A36",
                    color: "#9AA4B2",
                  }}
                >
                  {copied ? (
                    <Check size={12} style={{ color: "#A855F7" }} />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="p-4 max-h-[500px] overflow-y-auto scrollbar-nova">
                {formatScript(script)}
              </div>
            </motion.div>
          )}
          {!loading && !script && (
            <div
              data-ocid="video.empty_state"
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <Clapperboard size={32} style={{ color: "#232A36" }} />
              <p className="text-sm" style={{ color: "#9AA4B2" }}>
                Your video script will appear here
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

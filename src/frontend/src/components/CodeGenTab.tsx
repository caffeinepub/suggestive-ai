import { Check, Code2, Copy, Loader2, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { NoApiKeyBanner } from "./NoApiKeyBanner";

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Rust",
  "HTML/CSS",
  "SQL",
  "Go",
  "Java",
  "C++",
];

const SKELETON_PCTS = [65, 100, 88, 72, 95, 80, 60];

interface CodeGenTabProps {
  apiKey: string;
  onOpenSettings: () => void;
}

export function CodeGenTab({ apiKey, onOpenSettings }: CodeGenTabProps) {
  const [task, setTask] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  if (!apiKey) return <NoApiKeyBanner onOpenSettings={onOpenSettings} />;

  const generate = async () => {
    if (!task.trim() || loading) return;
    setLoading(true);
    setCode("");
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
                content: `You are an expert programmer. Generate clean, well-commented ${language} code for the following task. Return only the code block, no explanations.`,
              },
              { role: "user", content: task.trim() },
            ],
          }),
        },
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `API error ${response.status}`);
      }
      const data = await response.json();
      let result = data.choices[0].message.content.trim();
      result = result.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "");
      setCode(result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate code";
      toast.error(msg, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-nova">
      <div className="p-6 space-y-4">
        <div>
          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: "#E7EAF0" }}
          >
            Code Generator
          </h2>
          <p className="text-sm" style={{ color: "#9AA4B2" }}>
            Describe what you want to build and get production-ready code.
          </p>
        </div>

        <textarea
          data-ocid="code_gen.textarea"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate();
          }}
          placeholder="A React hook that fetches paginated data with loading and error states..."
          rows={3}
          className="nova-input w-full px-4 py-3 rounded-xl text-sm resize-none"
        />

        <div className="flex gap-3">
          <select
            data-ocid="code_gen.select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="nova-input px-3 py-2.5 rounded-lg text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button
            type="button"
            data-ocid="code_gen.primary_button"
            onClick={generate}
            disabled={!task.trim() || loading}
            className="nova-btn-primary flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Terminal size={15} /> Generate Code
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
              data-ocid="code_gen.loading_state"
              className="space-y-2"
            >
              {SKELETON_PCTS.map((pct) => (
                <div
                  key={pct}
                  className="skeleton-nova h-4"
                  style={{ width: `${pct}%` }}
                />
              ))}
            </motion.div>
          )}
          {code && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #232A36" }}
              data-ocid="code_gen.card"
            >
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{
                  background: "#0B0F16",
                  borderBottom: "1px solid #232A36",
                }}
              >
                <div className="flex items-center gap-2">
                  <Code2 size={14} style={{ color: "#A855F7" }} />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#9AA4B2" }}
                  >
                    {language}
                  </span>
                </div>
                <button
                  type="button"
                  data-ocid="code_gen.secondary_button"
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
              <pre
                className="nova-code-block p-4 m-0 border-0 rounded-none overflow-x-auto"
                style={{ background: "#0D1117" }}
              >
                <code style={{ color: "#E7EAF0" }}>{code}</code>
              </pre>
            </motion.div>
          )}
          {!loading && !code && (
            <div
              data-ocid="code_gen.empty_state"
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <Code2 size={32} style={{ color: "#232A36" }} />
              <p className="text-sm" style={{ color: "#9AA4B2" }}>
                Generated code will appear here
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

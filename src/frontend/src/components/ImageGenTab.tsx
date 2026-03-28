import { Download, ImageIcon, Loader2, Wand2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

function buildUrl(p: string, seed: number) {
  const encoded = encodeURIComponent(p.trim());
  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true&nofeed=true&seed=${seed}&model=flux`;
}

async function tryFetchImage(url: string): Promise<string> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.startsWith("image/")) throw new Error(`Not an image: ${ct}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export function ImageGenTab() {
  const [prompt, setPrompt] = useState("");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptLabel, setAttemptLabel] = useState("");
  const promptRef = useRef(prompt);
  promptRef.current = prompt;
  const abortRef = useRef<AbortController | null>(null);

  const generateImage = useCallback(async () => {
    const p = promptRef.current.trim();
    if (!p) return;

    // Cancel any previous attempt
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    setError(null);
    setLoading(true);
    setAttemptLabel("");

    const maxAttempts = 5;
    for (let i = 0; i < maxAttempts; i++) {
      if (ac.signal.aborted) return;
      if (i > 0) setAttemptLabel(`Retry ${i}/${maxAttempts - 1}...`);
      const seed = Math.floor(Math.random() * 999999);
      const url = buildUrl(p, seed);
      try {
        const blobUrl = await Promise.race([
          tryFetchImage(url),
          new Promise<never>((_, rej) =>
            setTimeout(() => rej(new Error("timeout")), 45000),
          ),
        ]);
        if (ac.signal.aborted) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        setObjectUrl(blobUrl);
        setLoading(false);
        setAttemptLabel("");
        return;
      } catch {
        // continue to next attempt
      }
    }

    if (!ac.signal.aborted) {
      setLoading(false);
      setError(
        "Could not generate this image. Try a more detailed description.",
      );
    }
  }, [objectUrl]);

  const downloadImage = () => {
    if (!objectUrl) return;
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "generated-image.png";
    a.click();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-nova">
      <div className="p-6 space-y-4">
        <div>
          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: "#E7EAF0" }}
          >
            Image Generation
          </h2>
          <p className="text-sm" style={{ color: "#9AA4B2" }}>
            Describe what you want to create and AI will generate it.
          </p>
        </div>

        {/* Prompt Input */}
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "#141A24", border: "1px solid #232A36" }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                generateImage();
              }
            }}
            placeholder="Describe the image you want to generate..."
            rows={3}
            className="w-full bg-transparent resize-none outline-none text-sm leading-relaxed"
            style={{ color: "#E7EAF0" }}
            data-ocid="imagegen.textarea"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background:
                  loading || !prompt.trim()
                    ? "rgba(168,85,247,0.3)"
                    : "rgba(168,85,247,0.8)",
                color: "#fff",
                cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
              }}
              data-ocid="imagegen.primary_button"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 size={14} /> Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated image */}
        {objectUrl && !loading && (
          <img
            src={objectUrl}
            alt={prompt}
            className="w-full object-cover rounded-2xl"
          />
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#F87171",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
            data-ocid="imagegen.error_state"
          >
            {error}
          </div>
        )}

        {/* Loading placeholder */}
        {loading && (
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{
              background: "#141A24",
              border: "1px solid #232A36",
              height: 300,
            }}
            data-ocid="imagegen.loading_state"
          >
            <div className="text-center space-y-3">
              <Loader2
                size={32}
                className="animate-spin mx-auto"
                style={{ color: "#A855F7" }}
              />
              <p className="text-sm" style={{ color: "#9AA4B2" }}>
                {attemptLabel || "Generating your image..."}
              </p>
              <p className="text-xs" style={{ color: "#5A6478" }}>
                This can take up to 30 seconds
              </p>
            </div>
          </div>
        )}

        {/* Download bar */}
        {objectUrl && !loading && (
          <div
            className="p-3 flex items-center justify-between rounded-b-2xl -mt-4"
            style={{
              background: "#141A24",
              border: "1px solid #232A36",
              borderTop: "none",
            }}
          >
            <p
              className="text-xs truncate flex-1 mr-3"
              style={{ color: "#9AA4B2" }}
            >
              {prompt}
            </p>
            <button
              type="button"
              onClick={downloadImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: "rgba(168,85,247,0.1)",
                border: "1px solid rgba(168,85,247,0.2)",
                color: "#A855F7",
              }}
              data-ocid="imagegen.secondary_button"
            >
              <Download size={12} /> Save
            </button>
          </div>
        )}

        {/* Empty state */}
        {!objectUrl && !loading && !error && (
          <div
            className="flex flex-col items-center justify-center py-12 gap-4 rounded-2xl"
            style={{ background: "#141A24", border: "1px dashed #232A36" }}
            data-ocid="imagegen.empty_state"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(168,85,247,0.1)",
                border: "1px solid rgba(168,85,247,0.2)",
              }}
            >
              <ImageIcon size={24} style={{ color: "#A855F7" }} />
            </div>
            <p className="text-sm" style={{ color: "#9AA4B2" }}>
              Your generated image will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

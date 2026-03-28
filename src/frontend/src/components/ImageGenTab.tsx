import { Download, ImageIcon, Loader2, Wand2 } from "lucide-react";
import { useState } from "react";

export function ImageGenTab() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildUrl = (seed: number) => {
    const encoded = encodeURIComponent(prompt.trim());
    return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true&seed=${seed}&enhance=true&model=turbo`;
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    if (imageUrl?.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);

    let lastErr = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const url = buildUrl(
          attempt === 0 ? Date.now() : Math.floor(Math.random() * 999999),
        );
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        if (!blob.type.startsWith("image/")) throw new Error("Not an image");
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        setLoading(false);
        return;
      } catch (e) {
        lastErr = String(e);
        // small delay before retry
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    setLoading(false);
    setError("Could not generate this image. Try a more detailed description.");
    console.error("Image gen failed:", lastErr);
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `suggestive-ai-${Date.now()}.jpg`;
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

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#F87171",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
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
          >
            <div className="text-center space-y-3">
              <Loader2
                size={32}
                className="animate-spin mx-auto"
                style={{ color: "#A855F7" }}
              />
              <p className="text-sm" style={{ color: "#9AA4B2" }}>
                Generating your image...
              </p>
            </div>
          </div>
        )}

        {/* Generated Image */}
        {imageUrl && !loading && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid #232A36" }}
          >
            <img src={imageUrl} alt={prompt} className="w-full object-cover" />
            <div
              className="p-3 flex items-center justify-between"
              style={{ background: "#141A24" }}
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
              >
                <Download size={12} /> Save
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!imageUrl && !loading && !error && (
          <div
            className="flex flex-col items-center justify-center py-12 gap-4 rounded-2xl"
            style={{ background: "#141A24", border: "1px dashed #232A36" }}
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

import { ImageIcon, Wand2 } from "lucide-react";
import { NoApiKeyBanner } from "./NoApiKeyBanner";

interface ImageGenTabProps {
  apiKey: string;
  onOpenSettings: () => void;
}

export function ImageGenTab({ apiKey, onOpenSettings }: ImageGenTabProps) {
  if (!apiKey) return <NoApiKeyBanner onOpenSettings={onOpenSettings} />;

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
            Generate images from text descriptions.
          </p>
        </div>

        <div
          className="flex flex-col items-center justify-center py-16 gap-5 rounded-2xl"
          style={{ background: "#141A24", border: "1px solid #232A36" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.2)",
            }}
          >
            <Wand2 size={28} style={{ color: "#A855F7" }} />
          </div>
          <div className="text-center px-6">
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "#E7EAF0" }}
            >
              Image generation coming soon
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#9AA4B2" }}>
              Image generation will be added in a future update.
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
            style={{
              background: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.2)",
              color: "#A855F7",
            }}
          >
            <ImageIcon size={12} />
            Suggestive AI
          </div>
        </div>
      </div>
    </div>
  );
}

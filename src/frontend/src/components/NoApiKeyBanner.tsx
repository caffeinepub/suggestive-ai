import { KeyRound } from "lucide-react";

export function NoApiKeyBanner() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(168,85,247,0.15)",
          border: "1px solid rgba(168,85,247,0.3)",
        }}
      >
        <KeyRound size={28} style={{ color: "#A855F7" }} />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#E7EAF0" }}>
          API Key Required
        </h3>
        <p className="text-sm max-w-xs" style={{ color: "#9AA4B2" }}>
          Please configure the API key in the application settings.
        </p>
      </div>
    </div>
  );
}

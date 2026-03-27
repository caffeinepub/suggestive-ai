import { Eye, EyeOff, KeyRound, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function SettingsDialog({
  open,
  onClose,
  apiKey,
  onApiKeyChange,
}: SettingsDialogProps) {
  const [inputKey, setInputKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (open) setInputKey("");
  }, [open]);

  const handleSave = () => {
    const key = inputKey.trim();
    if (!key) return;
    onApiKeyChange(key);
    toast.success("API key saved successfully");
    setInputKey("");
    onClose();
  };

  const handleClear = () => {
    onApiKeyChange("");
    toast.success("API key removed");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        data-ocid="settings.dialog"
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "#141A24", border: "1px solid #232A36" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(168,85,247,0.15)" }}
            >
              <KeyRound size={16} style={{ color: "#A855F7" }} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: "#E7EAF0" }}>
                Settings
              </h2>
              <p className="text-xs" style={{ color: "#9AA4B2" }}>
                Configure your API key
              </p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="settings.close_button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "#9AA4B2" }}
          >
            <X size={16} />
          </button>
        </div>

        {apiKey && (
          <div
            className="mb-4 p-3 rounded-lg flex items-center justify-between"
            style={{
              background: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.2)",
            }}
          >
            <div>
              <p
                className="text-xs font-medium mb-0.5"
                style={{ color: "#A855F7" }}
              >
                Current Key
              </p>
              <p className="text-sm font-mono" style={{ color: "#E7EAF0" }}>
                {apiKey.slice(0, 8)}••••••••{apiKey.slice(-4)}
              </p>
            </div>
            <button
              type="button"
              data-ocid="settings.delete_button"
              onClick={handleClear}
              className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
              style={{ color: "#9AA4B2" }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        <div className="space-y-3">
          <label
            htmlFor="api-key-input"
            className="block text-sm font-medium"
            style={{ color: "#9AA4B2" }}
          >
            API Key
          </label>
          <div className="relative">
            <input
              id="api-key-input"
              data-ocid="settings.input"
              type={showKey ? "text" : "password"}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Enter your API key..."
              className="nova-input w-full px-3 py-2.5 pr-10 rounded-lg text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#9AA4B2" }}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <p className="text-xs" style={{ color: "#9AA4B2" }}>
            Your key is saved in your browser only.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            data-ocid="settings.cancel_button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: "#0B0F16",
              border: "1px solid #232A36",
              color: "#9AA4B2",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid="settings.save_button"
            onClick={handleSave}
            disabled={!inputKey.trim()}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium nova-btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}

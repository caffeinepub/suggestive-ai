import {
  Check,
  Loader2,
  Paperclip,
  Pencil,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { NoApiKeyBanner } from "./NoApiKeyBanner";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

let msgIdCounter = 0;

const WELCOME_MSG: Message = {
  id: 0,
  role: "assistant",
  content:
    "Hi! I'm Suggestive AI, your assistant. I can help you with anything — ask me questions, brainstorm ideas, write content, or just chat. What's on your mind?",
};

interface ChatTabProps {
  apiKey: string;
  onOpenSettings: () => void;
  onSaveHistory?: (messages: Array<{ role: string; content: string }>) => void;
  initialMessages?: Array<{ role: "user" | "assistant"; content: string }>;
}

function buildInitialMessages(
  init?: Array<{ role: "user" | "assistant"; content: string }>,
): Message[] {
  if (init && init.length > 0) {
    return init.map((m) => ({
      id: ++msgIdCounter,
      role: m.role,
      content: m.content,
    }));
  }
  return [{ ...WELCOME_MSG, id: 0 }];
}

export function ChatTab({
  apiKey,
  onOpenSettings,
  onSaveHistory,
  initialMessages,
}: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>(() =>
    buildInitialMessages(initialMessages),
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{
    name: string;
    base64?: string;
    isImage: boolean;
  } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageCount = messages.length;
  const prevInitialRef = useRef(initialMessages);

  // Reload messages when history is loaded (reference change)
  useEffect(() => {
    if (
      initialMessages !== prevInitialRef.current &&
      initialMessages &&
      initialMessages.length > 0
    ) {
      prevInitialRef.current = initialMessages;
      setMessages(buildInitialMessages(initialMessages));
    }
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachment({
          name: file.name,
          base64: ev.target?.result as string,
          isImage: true,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setAttachment({ name: file.name, isImage: false });
    }
    e.target.value = "";
  };

  const sendMessage = async (overrideMessages?: Message[]) => {
    const content = input.trim();
    if ((!content && !attachment) || loading) return;
    if (!apiKey) {
      onOpenSettings();
      return;
    }

    let userContent = content;
    if (attachment) {
      userContent = `[Attached: ${attachment.name}]${content ? `\n${content}` : ""}`;
    }

    const newMsg: Message = {
      id: ++msgIdCounter,
      role: "user",
      content: userContent,
    };
    const base = overrideMessages ?? messages;
    const newMessages = [...base, newMsg];
    setMessages(newMessages);
    setInput("");
    const currentAttachment = attachment;
    setAttachment(null);
    setLoading(true);

    try {
      const systemMessages: Array<{ role: string; content: string }> = [
        {
          role: "system",
          content:
            "You are Suggestive AI, a helpful and friendly AI assistant.",
        },
      ];

      if (currentAttachment?.isImage && currentAttachment.base64) {
        systemMessages.push({
          role: "system",
          content: `The user has attached an image (${currentAttachment.name}). Base64 data: ${currentAttachment.base64.slice(0, 200)}... [image data truncated for text model]`,
        });
      }

      const apiMessages = [
        ...systemMessages,
        ...newMessages
          .filter((m) => !(m.id === 0 && m.role === "assistant"))
          .map(({ role, content: c }) => ({ role, content: c })),
      ];

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
            messages: apiMessages,
          }),
        },
      );
      if (!response.ok) {
        const err = await response.json();
        const msg = err.error?.message || `API error ${response.status}`;
        throw new Error(msg);
      }
      const data = await response.json();
      const reply = data.choices[0].message.content;
      const updatedMessages = [
        ...newMessages,
        { id: ++msgIdCounter, role: "assistant" as const, content: reply },
      ];
      setMessages(updatedMessages);
      onSaveHistory?.(
        updatedMessages
          .filter((m) => m.id !== 0)
          .map(({ role, content: c }) => ({ role, content: c })),
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to get response";
      toast.error(msg, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditingText(msg.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async (msgId: number) => {
    const text = editingText.trim();
    if (!text) return;
    // Find index, truncate messages after this point (remove that message and everything after)
    const idx = messages.findIndex((m) => m.id === msgId);
    if (idx === -1) return;
    const truncated = messages.slice(0, idx);
    setEditingId(null);
    setEditingText("");
    setInput(text);
    // We need to send with truncated messages as base and the new text
    // Use a short timeout so state updates settle
    setTimeout(async () => {
      const content = text;
      if (!apiKey) {
        onOpenSettings();
        return;
      }
      const newMsg: Message = { id: ++msgIdCounter, role: "user", content };
      const newMessages = [...truncated, newMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);
      try {
        const apiMessages = [
          {
            role: "system",
            content:
              "You are Suggestive AI, a helpful and friendly AI assistant.",
          },
          ...newMessages
            .filter((m) => !(m.id === 0 && m.role === "assistant"))
            .map(({ role, content: c }) => ({ role, content: c })),
        ];
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
              messages: apiMessages,
            }),
          },
        );
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || `API error ${response.status}`);
        }
        const data = await response.json();
        const reply = data.choices[0].message.content;
        const updatedMessages = [
          ...newMessages,
          { id: ++msgIdCounter, role: "assistant" as const, content: reply },
        ];
        setMessages(updatedMessages);
        onSaveHistory?.(
          updatedMessages
            .filter((m) => m.id !== 0)
            .map(({ role, content: c }) => ({ role, content: c })),
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to get response";
        toast.error(msg, { duration: 6000 });
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  if (!apiKey) return <NoApiKeyBanner onOpenSettings={onOpenSettings} />;

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--nova-border)" }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: "var(--nova-muted)" }}
        >
          {messages.length - 1} messages
        </span>
        <button
          type="button"
          data-ocid="chat.delete_button"
          onClick={() =>
            setMessages([
              {
                ...WELCOME_MSG,
                id: ++msgIdCounter,
                content: "Conversation cleared. How can I help you?",
              },
            ])
          }
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-red-500/10"
          style={{
            color: "var(--nova-muted)",
            border: "1px solid var(--nova-border)",
          }}
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-nova"
        data-ocid="chat.list"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 group ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
              data-ocid={`chat.item.${i + 1}`}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center nova-glow"
                  style={{
                    background: "linear-gradient(135deg, #A855F7, #7C3AED)",
                  }}
                >
                  <Sparkles size={14} style={{ color: "white" }} />
                </div>
              )}
              <div
                className={`flex flex-col gap-1 max-w-[75%] ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {editingId === msg.id ? (
                  <div className="w-full">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          saveEdit(msg.id);
                        }
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="nova-input w-full px-3 py-2 rounded-xl text-sm resize-none"
                      rows={3}
                      // biome-ignore lint/a11y/noAutofocus: intentional
                      autoFocus
                    />
                    <div className="flex gap-2 mt-1.5 justify-end">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors"
                        style={{
                          color: "var(--nova-muted)",
                          border: "1px solid var(--nova-border)",
                        }}
                      >
                        <X size={11} /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(msg.id)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg nova-btn-primary"
                      >
                        <Check size={11} /> Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "message-bubble-user"
                        : "message-bubble-ai"
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
                {msg.role === "user" && editingId !== msg.id && (
                  <button
                    type="button"
                    onClick={() => startEdit(msg)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg transition-all hover:bg-black/5"
                    style={{ color: "var(--nova-muted)" }}
                    title="Edit message"
                  >
                    <Pencil size={10} /> Edit
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #A855F7, #7C3AED)",
              }}
            >
              <Sparkles size={14} style={{ color: "white" }} />
            </div>
            <div
              className="message-bubble-ai px-4 py-3"
              data-ocid="chat.loading_state"
            >
              <div className="flex gap-1 items-center">
                {([0, 1, 2] as const).map((n) => (
                  <div
                    key={n}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "#A855F7",
                      animation: `pulse-glow 1.2s ease-in-out ${n * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div
        className="px-6 py-4 shrink-0"
        style={{ borderTop: "1px solid var(--nova-border)" }}
      >
        {/* Attachment preview */}
        {attachment && (
          <div className="mb-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{
                border: "1px solid #A855F7",
                background: "rgba(168,85,247,0.08)",
                color: "#A855F7",
              }}
            >
              <Paperclip size={11} />
              <span className="max-w-[200px] truncate">{attachment.name}</span>
              <button
                type="button"
                data-ocid="chat.attachment.close_button"
                onClick={() => setAttachment(null)}
                className="hover:text-red-400 transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.txt,.doc,.docx"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            type="button"
            data-ocid="chat.upload_button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl shrink-0 transition-colors hover:bg-black/5"
            style={{
              color: attachment ? "#A855F7" : "var(--nova-muted)",
              border: "1px solid var(--nova-border)",
            }}
            title="Attach file or image"
          >
            <Paperclip size={18} />
          </button>
          <textarea
            data-ocid="chat.textarea"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Message Suggestive AI... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="nova-input flex-1 px-4 py-3 rounded-xl text-sm resize-none"
            style={{ maxHeight: "120px", overflowY: "auto" }}
          />
          <button
            type="button"
            data-ocid="chat.submit_button"
            onClick={() => sendMessage()}
            disabled={(!input.trim() && !attachment) || loading}
            className="nova-btn-primary p-3 rounded-xl shrink-0"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import { BookOpen, GraduationCap, Loader2, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { NoApiKeyBanner } from "./NoApiKeyBanner";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const SKELETON_WIDTHS = [
  "w-full",
  "w-5/6",
  "w-4/5",
  "w-full",
  "w-3/4",
  "w-full",
  "w-5/6",
];

interface QaItem {
  id: number;
  q: string;
  a: string;
}

let qaIdCounter = 0;

interface TeacherTabProps {
  apiKey: string;
  onOpenSettings: () => void;
}

async function groqText(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    },
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `API error ${response.status}`);
  }
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export function TeacherTab({ apiKey, onOpenSettings }: TeacherTabProps) {
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState("");
  const [question, setQuestion] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<QaItem[]>([]);
  const [currentSubject, setCurrentSubject] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");

  if (!apiKey) return <NoApiKeyBanner onOpenSettings={onOpenSettings} />;

  const startLesson = async () => {
    if (!subject.trim() || loading) return;
    setLoading(true);
    setLesson("");
    setQaHistory([]);
    setCurrentSubject(subject.trim());
    setCurrentLevel(level);
    try {
      const result = await groqText(
        apiKey,
        `You are an expert teacher. Create a clear, engaging lesson for a ${level} student. Structure it with: 1) Overview, 2) Key Concepts (3-5 points), 3) Examples, 4) Summary. Use clear language appropriate for the level.`,
        `Teach me about ${subject.trim()} at the ${level} level.`,
      );
      setLesson(result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate lesson";
      toast.error(msg, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim() || qaLoading) return;
    const q = question.trim();
    setQaLoading(true);
    setQuestion("");
    try {
      const result = await groqText(
        apiKey,
        `You are an expert teacher teaching ${currentSubject} at ${currentLevel} level. Answer the student's question clearly and helpfully, building on the lesson you just taught.`,
        `Lesson context: ${lesson.slice(0, 500)}...\n\nStudent question: ${q}`,
      );
      setQaHistory((prev) => [...prev, { id: ++qaIdCounter, q, a: result }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to get answer";
      toast.error(msg, { duration: 6000 });
    } finally {
      setQaLoading(false);
    }
  };

  const formatLesson = (text: string) => {
    return text.split("\n").map((line, i) => {
      const lineKey = `lesson-line-${i}`;
      const isBold =
        /^\*\*(.*?)\*\*/.test(line) ||
        /^#+\s/.test(line) ||
        /^\d+\)/.test(line.trim());
      if (isBold)
        return (
          <div
            key={lineKey}
            className="font-semibold text-sm mt-3 mb-1"
            style={{ color: "#E7EAF0" }}
          >
            {line.replace(/^#+\s/, "").replace(/\*\*/g, "")}
          </div>
        );
      if (line.trim().startsWith("-") || line.trim().startsWith("•"))
        return (
          <div
            key={lineKey}
            className="text-sm pl-3 border-l-2 mb-1"
            style={{ color: "#9AA4B2", borderColor: "#A855F7" }}
          >
            {line.replace(/^[-•]\s/, "")}
          </div>
        );
      return (
        <div
          key={lineKey}
          className="text-sm leading-relaxed mb-1"
          style={{ color: line.trim() ? "#C4C9D4" : undefined }}
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
            Teacher Mode
          </h2>
          <p className="text-sm" style={{ color: "#9AA4B2" }}>
            Learn anything from an expert AI teacher. Ask follow-up questions
            after your lesson.
          </p>
        </div>

        <div className="flex gap-3">
          <input
            data-ocid="teacher.input"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startLesson()}
            placeholder="Quantum Physics, JavaScript Promises, French Revolution..."
            className="nova-input flex-1 px-4 py-2.5 rounded-xl text-sm"
          />
          <select
            data-ocid="teacher.select"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="nova-input px-3 py-2.5 rounded-lg text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          data-ocid="teacher.primary_button"
          onClick={startLesson}
          disabled={!subject.trim() || loading}
          className="nova-btn-primary w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Preparing your
              lesson...
            </>
          ) : (
            <>
              <GraduationCap size={16} /> Start Lesson
            </>
          )}
        </button>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              data-ocid="teacher.loading_state"
              className="space-y-3 p-4 rounded-xl"
              style={{ background: "#141A24", border: "1px solid #232A36" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} style={{ color: "#A855F7" }} />
                <span className="text-xs" style={{ color: "#A855F7" }}>
                  Preparing lesson...
                </span>
              </div>
              {SKELETON_WIDTHS.map((w) => (
                <div key={w} className={`skeleton-nova h-4 ${w}`} />
              ))}
            </motion.div>
          )}
          {lesson && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
              data-ocid="teacher.card"
            >
              <div
                className="p-5 rounded-xl"
                style={{ background: "#141A24", border: "1px solid #232A36" }}
              >
                <div
                  className="flex items-center gap-2 mb-4 pb-3"
                  style={{ borderBottom: "1px solid #232A36" }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #A855F7, #7C3AED)",
                    }}
                  >
                    <GraduationCap size={14} style={{ color: "white" }} />
                  </div>
                  <div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#E7EAF0" }}
                    >
                      {currentSubject}
                    </span>
                    <span
                      className="text-xs ml-2 px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(168,85,247,0.15)",
                        color: "#A855F7",
                      }}
                    >
                      {currentLevel}
                    </span>
                  </div>
                </div>
                <div>{formatLesson(lesson)}</div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{ background: "#141A24", border: "1px solid #232A36" }}
              >
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: "#E7EAF0" }}
                >
                  Ask a question about this topic
                </p>

                {qaHistory.length > 0 && (
                  <div className="space-y-3 mb-4" data-ocid="teacher.list">
                    {qaHistory.map((item, idx) => (
                      <div
                        key={item.id}
                        data-ocid={`teacher.item.${idx + 1}`}
                        className="space-y-2"
                      >
                        <div
                          className="text-sm font-medium px-3 py-2 rounded-lg"
                          style={{
                            background: "rgba(168,85,247,0.1)",
                            color: "#A855F7",
                          }}
                        >
                          Q: {item.q}
                        </div>
                        <div
                          className="text-sm px-3 py-2 rounded-lg"
                          style={{ background: "#0B0F16", color: "#C4C9D4" }}
                        >
                          {item.a}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {qaLoading && (
                  <div
                    data-ocid="teacher.loading_state"
                    className="flex items-center gap-2 mb-3"
                  >
                    <Loader2
                      size={14}
                      className="animate-spin"
                      style={{ color: "#A855F7" }}
                    />
                    <span className="text-xs" style={{ color: "#9AA4B2" }}>
                      Thinking...
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    data-ocid="teacher.search_input"
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                    placeholder="Ask anything about this topic..."
                    className="nova-input flex-1 px-3 py-2.5 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    data-ocid="teacher.submit_button"
                    onClick={askQuestion}
                    disabled={!question.trim() || qaLoading}
                    className="nova-btn-primary p-2.5 rounded-lg"
                  >
                    {qaLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {!loading && !lesson && (
            <div
              data-ocid="teacher.empty_state"
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <GraduationCap size={32} style={{ color: "#232A36" }} />
              <p className="text-sm" style={{ color: "#9AA4B2" }}>
                Enter a subject to start your personalized lesson
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

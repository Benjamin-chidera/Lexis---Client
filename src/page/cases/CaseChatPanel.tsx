import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Brain, Terminal, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCasesStore } from "@/store/casesStore";
import type { ChatMessage } from "@/store/casesStore";

interface CaseChatPanelProps {
  caseId: string;
  messages: ChatMessage[];
}

export const CaseChatPanel = ({ caseId, messages }: CaseChatPanelProps) => {
  const isAiTyping = useCasesStore((state) => state.isAiTyping);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change or typing starts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Intelligence Stream</h2>
        </div>
        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/1.25rem-3 py-1 rounded-md text-[0.625rem] font-bold uppercase tracking-widest">
          AI Active
        </Badge>
      </div>

      {/* Chat message list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth">
        {/* Session start label */}
        <div className="flex flex-col items-center">
          <span className="text-[0.625rem] uppercase tracking-[0.4em] font-black text-slate-600 mb-0.25rem-4 py-1.5 rounded-full">
            Session Start
          </span>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <Brain className="w-7 h-7 text-purple-400/50" />
            </div>
            <p className="text-slate-600 text-sm font-medium">
              Start the conversation below
            </p>
            <p className="text-slate-700 text-xs mt-1">
              Ask Lexis AI anything about this case
            </p>
          </div>
        )}

        {messages.map((message) => {
          if (message.role === "user") {
            return <UserMessage key={message.id} message={message} />;
          }
          return <AiMessage key={message.id} message={message} caseId={caseId} />;
        })}

        {/* Typing indicator — shown while the AI is generating a response */}
        {isAiTyping && <TypingIndicator />}

        {/* Invisible anchor for auto-scroll */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

// --- Sub-components ---

const UserMessage = ({ message }: { message: ChatMessage }) => {
  return (
    <div className="flex flex-col items-end gap-2 max-w-[85%] ml-auto group">
      <div className="bg-white/4 border border-white/10 rounded-2xl p-4 text-slate-300 text-sm leading-relaxed shadow-xl">
        {message.content}
      </div>
      <span className="text-[0.625rem] font-bold text-slate-600 uppercase tracking-widest mr-2">
        You · {message.timestamp}
      </span>
    </div>
  );
};

const AiMessage = ({ message, caseId }: { message: ChatMessage; caseId: string }) => {
  const vault = useCasesStore((state) => state.cases.find((c) => c.id === caseId)?.vault ?? []);

  const handleCitationClick = () => {
    if (!message.citation) return;
    const match = vault.find(
      (v) => v.name === message.citation!.filename || v.name.includes(message.citation!.filename)
    );
    if (match?.url) {
      window.open(match.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col items-start gap-3 max-w-[92%]">
      {/* AI avatar + name */}
      <div className="flex items-center gap-3 ml-1">
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Terminal className="w-4 h-4 text-white" />
        </div>
        <span className="text-[0.625rem] font-black text-purple-400 uppercase tracking-[0.25em]">
          Lexis AI
        </span>
      </div>

      {/* Message bubble */}
      <div className="bg-white/2 border border-white/5 rounded-2xl p-5 relative overflow-hidden shadow-xl w-full">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500 rounded-l" />
        <div className="pl-3 text-sm leading-relaxed prose prose-invert prose-sm max-w-none overflow-x-hidden">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-white font-bold text-base mt-4 mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-white font-bold text-sm mt-4 mb-1.5">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-slate-200 font-semibold text-sm mt-3 mb-1">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-slate-300 font-semibold text-xs mt-2 mb-1 uppercase tracking-wide">{children}</h4>
              ),
              p: ({ children }) => (
                <p className="text-slate-300 mb-2">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="text-white font-semibold">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="text-slate-300 italic">{children}</em>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors break-all"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 text-slate-300 mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 text-slate-300 mb-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-slate-300">{children}</li>
              ),
              hr: () => <hr className="border-white/10 my-4" />,
              code: ({ children }) => (
                <code className="bg-white/5 text-slate-300 text-xs px-1.5 py-0.5 rounded font-mono break-all">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-purple-500/50 pl-3 text-slate-400 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Optional citation card */}
        {message.citation && (
          <div className="mt-4 pl-3">
            <div onClick={handleCitationClick} className="bg-white/3 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:border-white/20 transition-all cursor-pointer group/card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{message.citation.filename}</p>
                  <p className="text-[0.625rem] text-slate-500 font-medium">
                    {message.citation.exhibit}
                    {message.citation.page ? ` · Page ${message.citation.page}` : ""}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover/card:text-slate-400 transition-colors" />
            </div>
          </div>
        )}
      </div>

      <span className="text-[0.625rem] font-bold text-slate-600 uppercase tracking-widest ml-1">
        Lexis AI · {message.timestamp}
      </span>
    </div>
  );
};

// Typing indicator shown while the AI is generating a response.
// Displays the active pipeline stage label when available.
const TypingIndicator = () => {
  const researchStage = useCasesStore((state) => state.researchStage);

  return (
    <div className="flex flex-col items-start gap-3 max-w-[92%]">
      {/* AI avatar */}
      <div className="flex items-center gap-3 ml-1">
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Terminal className="w-4 h-4 text-white" />
        </div>
        <span className="text-[0.625rem] font-black text-purple-400 uppercase tracking-[0.25em]">
          Lexis AI
        </span>
      </div>

      {/* Bubble: stage label if available, otherwise bouncing dots */}
      <div className="bg-white/2 border border-white/5 rounded-2xl px-5 py-4 relative overflow-hidden shadow-xl">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500 rounded-l" />
        <div className="flex items-center gap-2 pl-3">
          {researchStage ? (
            <>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse shrink-0" />
              <span className="text-xs text-purple-300 font-medium animate-pulse">{researchStage}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

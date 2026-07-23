"use client";

import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  FilePenLine,
  FileText,
  LoaderCircle,
  MessageSquareText,
  RotateCcw,
  ScanSearch,
  Send,
  Sparkles,
  Target,
  WandSparkles,
  X,
} from "lucide-react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  careerAssistantActions,
  createAssistantMessage,
  createUserMessage,
  findCareerAssistantAction,
  initialCareerAssistantMessage,
} from "@/lib/career-assistant/actions";
import {
  clearCareerAssistantConversation,
  readCareerAssistantConversation,
  saveCareerAssistantConversation,
} from "@/lib/career-assistant/storage";
import type {
  CareerAssistantAction,
  CareerAssistantApiError,
  CareerAssistantMessage,
  CareerAssistantResponse,
  CareerAssistantSuggestedAction,
} from "@/lib/career-assistant/types";

const actionIcons = {
  "build-resume": FileText,
  "improve-resume": WandSparkles,
  "ats-score": ScanSearch,
  "find-jobs": BriefcaseBusiness,
  "tailor-resume": Target,
  "cover-letter": FilePenLine,
  interview: MessageSquareText,
  "track-applications":
    BriefcaseBusiness,
};

function getApiErrorMessage(
  error: CareerAssistantApiError,
  status: number,
): string {
  if (status === 401) {
    return "Please sign in to use AI responses. Quick actions are still available.";
  }

  if (status === 429) {
    return "Your Panthrex AI allowance has been reached. Quick actions are still available.";
  }

  return (
    error.details ||
    error.error ||
    "Panthrex AI is temporarily unavailable."
  );
}

export default function CareerAssistant() {
  const router = useRouter();
  const pathname = usePathname();

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] =
    useState(false);

  const [input, setInput] =
    useState("");

  const [messages, setMessages] = useState<
    CareerAssistantMessage[]
  >([initialCareerAssistantMessage]);

  const [suggestedActions, setSuggestedActions] =
    useState<
      CareerAssistantSuggestedAction[]
    >([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isResponding, setIsResponding] =
    useState(false);

  useEffect(() => {
    const storedConversation =
      readCareerAssistantConversation();

    if (
      storedConversation &&
      storedConversation.messages.length > 0
    ) {
      setMessages(
        storedConversation.messages,
      );
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    saveCareerAssistantConversation({
      messages,
    });
  }, [isLoaded, messages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    isOpen,
    isResponding,
    messages,
    suggestedActions,
  ]);

  function navigateToAction(
    action: CareerAssistantAction,
  ) {
    const userMessage =
      createUserMessage(action.label);

    const assistantMessage =
      createAssistantMessage(
        `Opening ${action.label.toLowerCase()} for you.`,
      );

    setMessages((current) => [
      ...current,
      userMessage,
      assistantMessage,
    ]);

    setSuggestedActions([]);
    router.push(action.href);
  }

  function navigateToSuggestion(
    action: CareerAssistantSuggestedAction,
  ) {
    const assistantMessage =
      createAssistantMessage(
        `Opening ${action.label.toLowerCase()}.`,
      );

    setMessages((current) => [
      ...current,
      assistantMessage,
    ]);

    setSuggestedActions([]);
    router.push(action.href);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const query = input.trim();

    if (!query || isResponding) {
      return;
    }

    const userMessage =
      createUserMessage(query);

    const previousMessages = messages;

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setSuggestedActions([]);
    setInput("");
    setIsResponding(true);

    try {
      const response = await fetch(
        "/api/career-assistant",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: query,
            currentPath: pathname,
            history: previousMessages
              .slice(-8)
              .map((message) => ({
                role: message.role,
                content: message.content,
              })),
          }),
        },
      );

      const data = (await response.json()) as
        | CareerAssistantResponse
        | CareerAssistantApiError;

      if (!response.ok) {
        const apiError =
          data as CareerAssistantApiError;

        throw new Error(
          getApiErrorMessage(
            apiError,
            response.status,
          ),
        );
      }

      const assistantResponse =
        data as CareerAssistantResponse;

      setMessages((current) => [
        ...current,
        createAssistantMessage(
          assistantResponse.reply,
        ),
      ]);

      setSuggestedActions(
        assistantResponse.suggestedActions,
      );

      if (
        assistantResponse.navigateTo &&
        assistantResponse.confidence >= 0.85
      ) {
        window.setTimeout(() => {
          router.push(
            assistantResponse.navigateTo!,
          );
        }, 900);
      }
    } catch (error) {
      const fallbackAction =
        findCareerAssistantAction(query);

      if (fallbackAction) {
        setMessages((current) => [
          ...current,
          createAssistantMessage(
            `The AI response is unavailable, but I found the appropriate Panthrex tool. Opening ${fallbackAction.label.toLowerCase()}.`,
          ),
        ]);

        window.setTimeout(() => {
          router.push(
            fallbackAction.href,
          );
        }, 600);
      } else {
        setMessages((current) => [
          ...current,
          createAssistantMessage(
            error instanceof Error
              ? error.message
              : "Panthrex AI is temporarily unavailable. You can still use the quick actions below.",
          ),
        ]);
      }
    } finally {
      setIsResponding(false);
    }
  }

  function handleReset() {
    clearCareerAssistantConversation();

    setMessages([
      createAssistantMessage(
        "Conversation cleared. What would you like to work on?",
      ),
    ]);

    setSuggestedActions([]);
    setInput("");
  }

  return (
    <>
      {isOpen && (
        <section
          aria-label="Panthrex Career Assistant"
          className="fixed bottom-24 right-4 z-[80] flex h-[min(680px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0e20]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:right-6"
        >
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <Bot size={21} />
              </span>

              <div>
                <h2 className="font-semibold text-white">
                  Panthrex AI
                </h2>

                <p className="text-xs text-emerald-300">
                  {isResponding
                    ? "Thinking..."
                    : "Career Assistant"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Clear conversation"
                onClick={handleReset}
                disabled={isResponding}
                className="rounded-xl p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <RotateCcw size={17} />
              </button>

              <button
                type="button"
                aria-label="Close Career Assistant"
                onClick={() =>
                  setIsOpen(false)
                }
                className="rounded-xl p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-indigo-500 text-white"
                        : "rounded-bl-md border border-white/10 bg-white/[0.055] text-white/75"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isResponding && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white/55">
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    Analysing your request
                  </div>
                </div>
              )}
            </div>

            {suggestedActions.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/30">
                  Suggested next steps
                </p>

                <div className="flex flex-wrap gap-2">
                  {suggestedActions.map(
                    (action) => (
                      <button
                        key={`${action.href}-${action.label}`}
                        type="button"
                        onClick={() =>
                          navigateToSuggestion(
                            action,
                          )
                        }
                        className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
                      >
                        {action.label}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/30">
                Quick actions
              </p>

              <div className="grid gap-2">
                {careerAssistantActions.map(
                  (action) => {
                    const Icon =
                      actionIcons[
                        action.id as keyof typeof actionIcons
                      ] ?? Sparkles;

                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() =>
                          navigateToAction(action)
                        }
                        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-indigo-400/30 hover:bg-indigo-500/[0.08]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 transition group-hover:bg-indigo-500/20">
                          <Icon size={18} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-white/85">
                            {action.label}
                          </span>

                          <span className="mt-0.5 block text-xs leading-5 text-white/35">
                            {
                              action.description
                            }
                          </span>
                        </span>

                        <ArrowRight
                          size={16}
                          className="shrink-0 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-indigo-300"
                        />
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 p-4"
          >
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 transition focus-within:border-indigo-400/50">
              <span className="sr-only">
                Ask Panthrex AI
              </span>

              <input
                type="text"
                value={input}
                maxLength={2000}
                disabled={isResponding}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="Ask Panthrex AI..."
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={
                  !input.trim() ||
                  isResponding
                }
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isResponding ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </label>
          </form>
        </section>
      )}

      <button
        type="button"
        aria-label={
          isOpen
            ? "Close Panthrex Career Assistant"
            : "Open Panthrex Career Assistant"
        }
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen((current) => !current)
        }
        className="fixed bottom-5 right-4 z-[80] flex h-14 items-center gap-3 rounded-2xl bg-indigo-500 px-4 text-white shadow-2xl shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400 sm:right-6"
      >
        {isOpen ? (
          <X size={21} />
        ) : (
          <Sparkles size={21} />
        )}

        <span className="hidden text-sm font-semibold sm:block">
          Panthrex AI
        </span>
      </button>
    </>
  );
}

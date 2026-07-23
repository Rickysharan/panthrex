import type {
  CareerAssistantConversation,
  CareerAssistantMessage,
} from "@/lib/career-assistant/types";

const STORAGE_KEY =
  "panthrex-career-assistant-conversation";

export function readCareerAssistantConversation():
  | CareerAssistantConversation
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue =
      window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (
      !parsedValue ||
      typeof parsedValue !== "object" ||
      !("messages" in parsedValue) ||
      !Array.isArray(parsedValue.messages)
    ) {
      return null;
    }

    return {
      messages: parsedValue.messages.filter(
        (
          message,
        ): message is CareerAssistantMessage =>
          Boolean(
            message &&
              typeof message === "object" &&
              "id" in message &&
              "role" in message &&
              "content" in message &&
              "createdAt" in message,
          ),
      ),
    };
  } catch (error) {
    console.error(
      "Failed to read Career Assistant conversation:",
      error,
    );

    return null;
  }
}

export function saveCareerAssistantConversation(
  conversation: CareerAssistantConversation,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(conversation),
    );
  } catch (error) {
    console.error(
      "Failed to save Career Assistant conversation:",
      error,
    );
  }
}

export function clearCareerAssistantConversation(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

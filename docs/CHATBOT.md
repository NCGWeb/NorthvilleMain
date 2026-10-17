# Chatbot

A chat window in the corner of every page. Visitors tap suggested questions (pills) or type their own and get an instant answer.

## How it works today (rules, no AI)

1. The window opens with the greeting and up to five pills.
2. A tap or a typed message goes to `POST /api/chat` (`apps/web/app/api/chat/route.ts`).
3. The route asks `getChatProvider().reply(...)` in `packages/core/src/chat.ts`.
4. The rules provider scores every active answer: an exact question match (a tapped pill) wins, then keyword phrases, then single keywords, then shared words with the question. A score of 3 or more is a match.
5. The reply comes back with text, an optional button, and three follow-up pills that exclude questions already asked.
6. If nothing matches, the "no answer" message is shown with Send an enquiry and WhatsApp buttons. Greetings and thanks get a short built-in reply.
7. Every message a visitor types is saved in `ChatQuestion` with whether it was answered.

## Editing it (admin)

| Where | What |
|---|---|
| Chatbot answers | Add, edit, reorder, switch off answers. Each has the question (also the pill text), trigger words, the answer, an optional button, and whether it shows as a pill. Order in the list is the order of the pills. |
| Chat questions | Read-only log of what visitors typed. Anything marked Not answered is a gap: add an answer for it. |
| Site settings, Chatbot | Switch the widget on or off, window title, opening message, no-answer message, typing hint. |

Answers can use `{email}` `{phone}` `{hrEmail}` `{hours}` `{response}` `{offices}` `{founders}`. They are filled from Site settings, Offices and Team at answer time, so contact details are never copied by hand and never go stale.

## Adding an AI model later

The widget and the API route only know the `ChatProvider` interface:

```ts
interface ChatProvider {
  reply(input: { message: string; asked?: string[] }): Promise<ChatReply>;
}
type ChatReply = { text: string; link?: { label: string; href: string }; matched: boolean; answerId?: string; suggestions: string[] };
```

To switch to an LLM:

1. Write `llmProvider` next to `rulesProvider` in `packages/core/src/chat.ts`. Call the model API (for example with the Anthropic SDK) with a system prompt built from the same data the rules use: the active `ChatAnswer` rows, services (`getServices`), offices, contact settings and team. Tell it to answer only from that data and to say it does not know otherwise, so it never invents prices or promises.
2. Keep the same return shape. Return `suggestions` from the pills (reuse the helper) so the tap-to-ask UI keeps working.
3. In `getChatProvider()` choose the provider with an environment variable such as `CHAT_PROVIDER=llm`, falling back to `rulesProvider` if the key is missing or the call fails.
4. Add `ANTHROPIC_API_KEY` (or the provider's key) to the web project on Vercel only.
5. Send the conversation history from the widget (`asked` already carries earlier questions) if you want multi-turn answers.
6. Keep the rate limit in the route and add a monthly cost cap.

A good hybrid: try the rules first, call the model only when no rule matches (`matched: false`), and log those questions as today.

## Safety notes

- Answers are plain text. Buttons only link to pages or full web addresses entered by editors.
- The route validates input (1 to 300 characters) and limits each visitor to 40 messages per 10 minutes per server instance.
- The log stores only what was typed. Do not ask visitors for personal details in the chat. The contact form is the place for that.

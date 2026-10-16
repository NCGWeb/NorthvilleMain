---
name: cms-plain-language
description: Use when adding or editing anything an editor sees in the admin (field labels, help text, buttons, empty states, errors). Keeps the CMS understandable for a non-technical person.
---

# Plain language CMS

The editor is a business person, not a developer. Every admin screen answers three questions: what is this, where does it show on the website, what happens when I press save.

## Fields (in `packages/content`)
- `label`: what a colleague would call it. "Page address" not "slug". "Show on website" not "isPublished". "Theme" not "groupId".
- `help`: one or two short sentences. What to type, how long, an example. Say what is optional.
- `where`: where the visitor sees it ("Menu, cards and the page heading"). Required on anything that is not obvious.
- Use `maxLength` where design or Google truncates (titles 60 to 70, descriptions 150 to 200).
- Optional fields say so. Required fields are marked and checked with a friendly message ("Please fill in Service name.").

## Writing rules
- Short declarative sentences. No jargon: no "slug", "block", "entity", "payload", "ISR", "cache".
- Name the thing the way it appears: "Reusable sections", "Service themes", "Publish to website".
- Errors say what to do next, never a stack trace or status code. "That web address is already used. Please pick another."
- Destructive actions confirm in plain words and offer the safe alternative ("To just hide it, switch off Show on website").
- Empty states say what the list is for and offer the next action.
- No em dash.

## Structure rules
- A list screen starts with a description and a "Where this shows on the website" line.
- Blocks that read from a list say so ("This content comes from Services") and link there. Never ask the editor to type the same thing twice.
- Add, edit and delete live in the generic screens. Do not build bespoke forms.

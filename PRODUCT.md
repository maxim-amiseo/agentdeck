# Product

## Register

product

## Users

Maxim, a solo developer/agency operator who runs several Claude Code CLI agents at once (e.g. "Backend", "Frontend") for different workstreams. He often drives the app hands-free via voice dictation (Whisperflow) while multitasking across other apps, and switches to the keyboard/mouse for direct terminal interaction (confirming prompts, typing quick corrections) when needed.

## Product Purpose

AgentDeck replaces a desktop full of raw terminal windows with one place to launch, name, and address multiple Claude Code agents. Say an agent's name and the rest of the sentence becomes its prompt, automatically routed and submitted — no manual window switching. Success looks like: the user never has to think about *which window* they're talking to, only *what* they want done.

## Brand Personality

Native macOS system-app feel: calm, precise, unobtrusive. Three words — **minimal, precise, quiet**. The interface should feel like it "just works" and gets out of the way; motion confirms state changes (routing, focus mode, agent switching) rather than decorating the screen.

## Anti-references

Not a generic enterprise SaaS dashboard: no card-grid-everywhere layouts, no corporate blue, no generic Bootstrap-style icon set. Not a gamer/RGB aesthetic either — no neon glows or saturated accent explosions.

## Design Principles

- **One clear focus at a time.** Even in grid view (multiple agents visible at once), the currently addressed agent should always be legible at a glance.
- **Motion communicates, it doesn't decorate.** Transitions exist to confirm what just happened (a routed utterance, a mode switch, a resize) — subtle, fast, exponential ease-out, never bouncy.
- **The tool disappears into the background.** It runs constantly while the user works elsewhere; chrome should be quiet enough not to compete for attention, but state (listening / manual / paused, which agent is active) must always be readable in a glance.
- **Voice and keyboard are equally first-class.** Nothing in the visual design should assume the user is only ever driving with a mouse.

## Accessibility & Inclusion

Personal single-user tool; no specific WCAG target requested. Standard `prefers-reduced-motion` support still applies to all added motion (crossfade/instant fallback), since the app runs long sessions in the background.

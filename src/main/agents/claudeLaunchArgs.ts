import type { Agent, Settings } from '../../shared/types'

/**
 * Builds the argv for spawning the `claude` CLI as a PTY's target process.
 *
 * Verified against `claude --help`: `--model` accepts an alias or a full
 * model name. The alias "sonnet" resolved to Sonnet 4.5 in this environment
 * (v2.1.37), not Sonnet 5, so the explicit model id is used instead. There is
 * no CLI flag for reasoning effort; that's a session-level choice (`/model`
 * inside the session), not a launch flag.
 *
 * Every agent launches with --dangerously-skip-permissions per user request:
 * this is a personal local tool, and the user wants zero permission prompts
 * across every agent by default.
 */
export function buildClaudeArgs(agent: Agent, settings: Settings): string[] {
  const args = ['--model', 'claude-sonnet-5', '--dangerously-skip-permissions']

  if (agent.resumeSessionId) args.push('--resume', agent.resumeSessionId)

  if (settings.claudeExtraArgs.trim().length > 0) {
    args.push(...settings.claudeExtraArgs.trim().split(/\s+/))
  }

  return args
}

export const CLAUDE_BIN = 'claude'

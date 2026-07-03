export const IPC = {
  AGENT_CREATE: 'agent:create',
  AGENT_RENAME: 'agent:rename',
  AGENT_SET_ALIASES: 'agent:set-aliases',
  AGENT_DELETE: 'agent:delete',
  AGENT_RESTART: 'agent:restart',
  AGENT_LIST: 'agent:list',
  AGENT_STATUS_CHANGED: 'agent:status-changed',

  PTY_INPUT: 'pty:input',
  PTY_SUBMIT: 'pty:submit',
  PTY_RESIZE: 'pty:resize',
  PTY_DATA: 'pty:data',
  PTY_EXIT: 'pty:exit',

  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  WINDOW_FOCUS: 'window:focus',
  WINDOW_BLUR: 'window:blur',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_TOGGLE_MAXIMIZE: 'window:toggle-maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:is-maximized',
  WINDOW_MAXIMIZED_CHANGED: 'window:maximized-changed',

  DIALOG_PICK_DIRECTORY: 'dialog:pick-directory',

  CLIPBOARD_WRITE_TEXT: 'clipboard:write-text',
  CLIPBOARD_READ_TEXT: 'clipboard:read-text',

  UPDATE_CHECK: 'update:check',
  UPDATE_INSTALL: 'update:install',
  UPDATE_AVAILABLE: 'update:available',
  UPDATE_NOT_AVAILABLE: 'update:not-available',
  UPDATE_DOWNLOADED: 'update:downloaded',
  UPDATE_ERROR: 'update:error',

  SESSIONS_LIST: 'sessions:list',
  SESSIONS_TOGGLE_PIN: 'sessions:toggle-pin'
} as const

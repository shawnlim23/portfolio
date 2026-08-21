#!/bin/bash
# Whenever a Claude Code session starts inside the portfolio project:
# opens a new iTerm2 tab running `npm run dev`, and once the dev server is
# actually listening, opens localhost:4321 as a new tab in the current
# Chrome window. Guarded against duplicate spawns: if the dev server is
# already listening on 4321, assumes both are already open and does nothing.

shopt -s nocasematch
case "$PWD" in
  "$HOME"/Desktop/projs/portfolio*) ;;
  *) exit 0 ;;
esac
shopt -u nocasematch

if lsof -i :4321 -sTCP:LISTEN >/dev/null 2>&1; then
  exit 0
fi

osascript <<'EOF'
tell application "iTerm"
  activate
  if (count of windows) = 0 then
    create window with default profile
  end if
  tell current window
    create tab with default profile
    tell current session
      write text "cd ~/Desktop/projs/portfolio && npm run dev"
    end tell
  end tell
end tell
EOF

# Wait for the dev server to actually be listening (up to 15s) before
# opening the browser tab, so it doesn't load a connection-refused page.
(
  for _ in $(seq 1 30); do
    if lsof -i :4321 -sTCP:LISTEN >/dev/null 2>&1; then
      osascript <<'EOF2'
tell application "Google Chrome"
  activate
  if (count of windows) = 0 then
    make new window
  end if
  tell front window
    make new tab with properties {URL:"http://localhost:4321"}
  end tell
end tell
EOF2
      break
    fi
    sleep 0.5
  done
) &

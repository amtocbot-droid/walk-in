#!/bin/bash
# Submit an action file to the browser daemon and wait for its result.
# usage: ./scripts/browser-act.sh <action.mjs> [timeout_seconds]
set -u
ACTION="$1"
TIMEOUT="${2:-120}"
DIR=/tmp/walkin-actions
NAME="$(basename "$ACTION" .mjs)"
mkdir -p "$DIR"
rm -f "$DIR/$NAME.result.json" "$DIR/$NAME.mjs.done"
cp "$ACTION" "$DIR/$NAME.mjs"
for i in $(seq 1 "$TIMEOUT"); do
  if [ -f "$DIR/$NAME.result.json" ]; then
    cat "$DIR/$NAME.result.json"
    exit 0
  fi
  sleep 1
done
echo '{"ok":false,"error":"timeout waiting for daemon result"}'
exit 1

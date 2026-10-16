#!/bin/bash
# PostToolUse hook for Write/Edit: reject files that contain an em dash (U+2014).
f=$(cat | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)
[ -z "$f" ] && exit 0
[ -f "$f" ] || exit 0
case "$f" in *node_modules*|*.next*|*/AGENTS.md|*.png|*.jpg|*.jpeg|*.webp|*.ico|*.svg) exit 0;; esac
if grep -n $'\xe2\x80\x94' "$f" >/dev/null 2>&1; then
  echo "Em dash found in $f. Replace with a comma, period, parentheses, or split the sentence:" >&2
  grep -n $'\xe2\x80\x94' "$f" | head -5 >&2
  exit 2
fi
exit 0

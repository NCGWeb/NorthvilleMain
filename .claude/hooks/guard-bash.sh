#!/bin/bash
# PreToolUse hook for Bash: block commands this repo forbids.
cmd=$(cat | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null)
deny() { echo "Blocked: $1" >&2; exit 2; }
echo "$cmd" | grep -Eq '(^|[;&| ])vercel( |$)' && ! echo "$cmd" | grep -q -- '--token' && deny "bare vercel command. The global CLI login is shared and often wrong. Deploy by git push, or pass --token and --scope (see CLAUDE.md)."
echo "$cmd" | grep -Eq 'npx vercel|vercel deploy' && ! echo "$cmd" | grep -q -- '--token' && deny "vercel deploy without --token/--scope. Check .vercelignore first (see parent CLAUDE.md)."
echo "$cmd" | grep -Eq 'git push.*(--force|-f)( |$)' && deny "force push."
echo "$cmd" | grep -Eq 'git add.*(\.env($| )|\.env\.local)' && deny "never commit .env files."
echo "$cmd" | grep -Eq 'git remote (set-url|add).*github\.com[:/]' && ! echo "$cmd" | grep -q 'github-ncgweb' && deny "use the SSH alias github-ncgweb for this repo's remote."
echo "$cmd" | grep -Eq 'prisma migrate reset|DROP DATABASE|SEED_RESET=1.*DATABASE_URL=.*neon' && deny "destructive database command. Ask the user first."
exit 0

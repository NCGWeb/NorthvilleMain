#!/bin/bash
# Run before committing: finds em dashes anywhere in tracked source and docs.
if grep -rn $'\xe2\x80\x94' --include='*.ts' --include='*.tsx' --include='*.css' --include='*.md' --include='*.json' --include='*.sh' --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude=AGENTS.md . ; then
  echo "Em dash found. Replace it." >&2; exit 1
fi
echo "No em dashes."

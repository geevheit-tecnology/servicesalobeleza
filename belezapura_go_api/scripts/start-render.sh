#!/bin/sh
set -eu

# Native Render deploys provide the source revision. Never migrate on startup.
APP_REVISION="${RENDER_GIT_COMMIT:-${APP_REVISION:-unknown}}"
export APP_REVISION
exec ./server

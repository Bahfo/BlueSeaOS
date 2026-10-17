#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
OPENWRT_DIR="$ROOT_DIR/work/openwrt"
FEEDS_CONFIG="$ROOT_DIR/config/feeds.conf.default"
FEEDS_LOCK="$ROOT_DIR/config/feed-revisions.lock"
OPENWRT_LOCK="$ROOT_DIR/config/openwrt.commit"

fail() {
    printf 'ERROR: %s\n' "$*" >&2
    exit 1
}

for file in "$FEEDS_CONFIG" "$FEEDS_LOCK" "$OPENWRT_LOCK"; do
    [[ -f "$file" ]] || fail "Required file not found: $file"
done

git -C "$OPENWRT_DIR" rev-parse --is-inside-work-tree \
    >/dev/null 2>&1 \
    || fail "OpenWrt checkout not found at $OPENWRT_DIR"

EXPECTED_OPENWRT="$(tr -d '[:space:]' < "$OPENWRT_LOCK")"
ACTUAL_OPENWRT="$(git -C "$OPENWRT_DIR" rev-parse HEAD)"

[[ "$EXPECTED_OPENWRT" =~ ^[0-9a-f]{40}$ ]] \
    || fail "config/openwrt.commit must contain a full Git commit hash"

if [[ "$ACTUAL_OPENWRT" != "$EXPECTED_OPENWRT" ]]; then
    fail "OpenWrt revision mismatch. Expected $EXPECTED_OPENWRT, got $ACTUAL_OPENWRT"
fi

printf 'OK: OpenWrt source revision %s\n' "$ACTUAL_OPENWRT"

cp "$FEEDS_CONFIG" "$OPENWRT_DIR/feeds.conf.default"

cd "$OPENWRT_DIR"

./scripts/feeds update -a
./scripts/feeds install -a

while read -r feed expected_revision; do
    [[ -z "${feed:-}" || "$feed" == \#* ]] && continue

    [[ "$expected_revision" =~ ^[0-9a-f]{40}$ ]] \
        || fail "Invalid revision for feed '$feed' in feed-revisions.lock"

    FEED_DIR="$OPENWRT_DIR/feeds/$feed"

    [[ -d "$FEED_DIR" ]] \
        || fail "Feed directory not found: $FEED_DIR"

    actual_revision="$(git -C "$FEED_DIR" rev-parse HEAD)" \
        || fail "Cannot read Git revision for feed '$feed'"

    if [[ "$actual_revision" != "$expected_revision" ]]; then
        fail "Feed '$feed' revision mismatch: expected $expected_revision, got $actual_revision"
    fi

    printf 'OK: %-12s %s\n' "$feed" "$actual_revision"
done < "$FEEDS_LOCK"

printf '\nFeed synchronization and revision verification completed.\n'

printf '\n Project feed configuration \n'
cat config/feeds.conf.default

printf '\n Revision lock \n'
cat config/feed-revisions.lock  
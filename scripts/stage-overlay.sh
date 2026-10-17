#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
OPENWRT_DIR="$ROOT_DIR/work/openwrt"
PROJECT_CONFIG="$ROOT_DIR/config/rpi5.config"
PROJECT_FILES="$ROOT_DIR/files"
INTERFACE_DIR="$ROOT_DIR/interface"
OVERLAY_DIR="$OPENWRT_DIR/files"

fail() {
    printf 'ERROR: %s\n' "$*" >&2
    exit 1
}

[[ -f "$OPENWRT_DIR/Makefile" ]] \
    || fail "OpenWrt source checkout not found."

[[ -f "$PROJECT_CONFIG" ]] \
    || fail "Missing config/rpi5.config."

for file in index.html styles.css app.js; do
    [[ -f "$INTERFACE_DIR/$file" ]] \
        || fail "Missing interface/$file."
done

ACL_FILE="$PROJECT_FILES/usr/share/rpcd/acl.d/blueseaos.json"

[[ -f "$ACL_FILE" ]] \
    || fail "Missing BlueSeaOS read-only ACL."

python3 -m json.tool "$ACL_FILE" >/dev/null \
    || fail "BlueSeaOS ACL contains invalid JSON."

for setting in \
    CONFIG_TARGET_bcm27xx=y \
    CONFIG_TARGET_bcm27xx_bcm2712=y \
    CONFIG_TARGET_bcm27xx_bcm2712_DEVICE_rpi-5=y \
    CONFIG_PACKAGE_rpcd=y \
    CONFIG_PACKAGE_uhttpd=y \
    CONFIG_PACKAGE_uhttpd-mod-ubus=y
do
    grep -Fxq "$setting" "$PROJECT_CONFIG" \
        || fail "Required configuration missing: $setting"
done

mkdir -p "$OVERLAY_DIR"
rsync -a "$PROJECT_FILES/" "$OVERLAY_DIR/"

mkdir -p "$OVERLAY_DIR/www"
rsync -a --delete "$INTERFACE_DIR/" "$OVERLAY_DIR/www/"

cmp "$ACL_FILE" \
    "$OVERLAY_DIR/usr/share/rpcd/acl.d/blueseaos.json" \
    || fail "Staged ACL does not match the project source."

for file in index.html styles.css app.js; do
    cmp "$INTERFACE_DIR/$file" "$OVERLAY_DIR/www/$file" \
        || fail "Staged frontend file differs: $file"
done

printf '\nOverlay staging completed successfully.\n'

printf '\n=== Web interface staged for firmware ===\n'
find "$OVERLAY_DIR/www" -maxdepth 1 -type f -printf '%f\n' | sort

printf '\n=== ACL staged for firmware ===\n'
printf '%s\n' \
    "$OVERLAY_DIR/usr/share/rpcd/acl.d/blueseaos.json"

printf '\n=== Verified hardware and package configuration ===\n'
printf '%s\n' \
    "Raspberry Pi 5 target" \
    "rpcd enabled" \
    "uhttpd enabled" \
    "uhttpd-mod-ubus enabled"

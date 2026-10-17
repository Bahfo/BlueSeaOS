cd ~/BlueSeaOS

{
    printf '# BlueSeaOS feed revision lock\n'
    printf '# Generated from the initialized OpenWrt checkout.\n'
    printf '# Feed name followed by its exact Git commit.\n\n'

    for feed in luci packages routing telephony video; do
        revision=$(git -C "work/openwrt/feeds/$feed" rev-parse HEAD) || exit 1
        printf '%s %s\n' "$feed" "$revision"
    done
} > config/feed-revisions.lock

printf '\n Feed configuration matches upstream \n'
cmp config/feeds.conf.default work/openwrt/feeds.conf.default \
    && echo "OK"

printf '\n Recorded feed revisions \n'
cat config/feed-revisions.lock

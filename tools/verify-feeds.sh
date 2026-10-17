# Script to verify, update, and install feeds from OpenWRT Project

cd ~/BlueSeaOS/work/openwrt
./scripts/feeds update -a

./scripts/feeds install -a

printf '\n Configured feeds \n'
cat feeds.conf.default

printf '\n Feed repositories \n'
for dir in feeds/*; do
    if [ -d "$dir" ]; then
        printf '\n%s\n' "$dir"
        git -C "$dir" rev-parse --short HEAD 2>/dev/null \
            || echo "No Git revision available"
    fi
done

printf '\n Feed configuration status \n'
git status --short
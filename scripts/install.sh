mkdir -p work

if [ -d work/openwrt/.git ]; then
    git -C work/openwrt remote set-url origin \
        https://github.com/openwrt/openwrt.git

    git -C work/openwrt fetch --depth 1 origin \
        refs/tags/v25.12.5:refs/tags/v25.12.5

    git -C work/openwrt checkout --detach v25.12.5
else
    git clone --depth 1 \
        --branch v25.12.5 \
        https://github.com/openwrt/openwrt.git \
        work/openwrt
fi

git -C work/openwrt rev-parse HEAD > config/openwrt.commit

git add config/openwrt.env config/openwrt.commit

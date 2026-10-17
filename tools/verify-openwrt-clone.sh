printf '\n OpenWrt release \n'
git -C work/openwrt describe --tags --exact-match

printf '\n Git remote \n'
git -C work/openwrt remote -v

printf '\n Exact source revision \n'
cat config/openwrt.commit

printf '\n Project status \n'
git status --short --branch
# Host Operating System Info Manager
# Grabs the Host OS Info and Version

printf 'BlueSeaOS Host OS Info Manager \n'
printf 'Generating Report ... \n'
sleep 2

printf 'CPU Architecture: '
uname -m 

printf 'Available CPU Threads: '
nproc 

printf 'Operating System Release: '
grep -E '^(PRETTY_NAME|VERSION_ID)=' /etc/os-release

printf 'Memory: \n'
free -h

printf 'Home Directory Disk Space: \n'
df -hT "$HOME"

printf 'Home Directory File System: \n'
findmnt -T "$HOME" -o TARGET,FSTYPE,OPTIONS

sleep 1
printf 'Please inspect your device if it has correct requirements \n'
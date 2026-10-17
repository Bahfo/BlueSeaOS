# Base script to install all requirements on the host device
# Follows Ubuntu / Mint Package Manager (apt)

sudo apt update

sudo apt install \
    build-essential \
    clang \
    flex \
    bison \
    g++ \
    gawk \
    gcc-multilib \
    g++-multilib \
    gettext \
    git \
    libncurses5-dev \
    libssl-dev \
    python3-setuptools \
    rsync \
    swig \
    unzip \
    zlib1g-dev \
    file \
    wget \
    bc \
    ccache \
    help2man \
    libelf-dev \
    liblzma-dev \
    pkg-config \
    python3-dev \
    subversion \
    time \
    xsltproc \
    xxd \
    zstd

printf '\n Compiler \n'
gcc --version | head -n 1

printf '\n C++ Compiler \n'
g++ --version | head -n 1

printf '\n Git \n'
git --version

printf '\n Python \n'
python3 --version

printf '\n Build tools \n'
for tool in make git rsync file wget pkg-config; do
    if command -v "$tool" >/dev/null 2>&1; then
        printf 'OK: %s\n' "$tool"
    else
        printf 'MISSING: %s\n' "$tool"
    fi
done
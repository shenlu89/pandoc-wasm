# Build Pandoc WebAssembly toolchain image
FROM ubuntu:22.04 AS builder

# Prevent interactive prompts during apt operations
ENV DEBIAN_FRONTEND=noninteractive
# Add GHC WebAssembly toolchain directory to PATH (populated later by bootstrap)
ENV PATH=$PATH:/root/.ghc-wasm/bin

# Install essential build tools and dependencies required by GHC, cabal, wasm utils, and pandoc
RUN apt-get update && apt-get install -y --no-install-recommends \
  curl wget git build-essential \
  python3 pkg-config libtinfo-dev libffi-dev libgmp-dev zlib1g-dev \
  cabal-install ghc \
  binaryen \
  ca-certificates \
  jq \
  unzip \
  zstd \
  && rm -rf /var/lib/apt/lists/*

# Install Wasmtime (WASM runtime) for running the compiled pandoc.wasm
RUN curl https://wasmtime.dev/install.sh -sSf | bash
ENV PATH="/root/.wasmtime/bin:$PATH"

# Install Haskell tooling used by the Pandoc build
RUN cabal update && cabal install alex happy
ENV PATH="/root/.cabal/bin:${PATH}"
ENV CURL_TIMEOUT=3600
RUN timeout 3600 curl -f -L --retry 10 --retry-delay 5 --connect-timeout 60 --max-time 3600 \
  https://gitlab.haskell.org/haskell-wasm/ghc-wasm-meta/-/raw/master/bootstrap.sh | sh

# Ensure bash is used so we can source environment scripts properly
SHELL ["/bin/bash", "-lc"]
# Make the GHC WASM environment auto-loaded for login shells
RUN printf 'source /root/.ghc-wasm/env\n' > /etc/profile.d/ghc-wasm.sh
# Verify that the wasm cabal wrapper is available
RUN which wasm32-wasi-cabal && echo 'GHC WebAssembly tools installed successfully'
# Also source env for root's interactive shells
RUN echo 'source /root/.ghc-wasm/env' >> /root/.bashrc

# Fetch the Pandoc repository (wasm branch) with shallow history
WORKDIR /
RUN git clone --branch wasm --single-branch --depth 1 https://github.com/haskell-wasm/pandoc.git

WORKDIR /pandoc
# Dry run to resolve and fetch all dependencies for the WASM target
RUN which wasm32-wasi-cabal && wasm32-wasi-cabal build pandoc-cli --dry-run
# Build the pandoc CLI for the wasm32-wasi target
RUN which wasm32-wasi-cabal && wasm32-wasi-cabal build pandoc-cli

# Locate the produced pandoc.wasm and optimize it with Binaryen's wasm-opt for size
WORKDIR /
RUN PANDOC_WASM_PATH=$(find /pandoc -type f -name pandoc.wasm -print -quit) && \
  if [ -z "$PANDOC_WASM_PATH" ]; then echo "Error: pandoc.wasm not found after build."; exit 1; fi && \
  echo "Found pandoc.wasm at $PANDOC_WASM_PATH" && \
  wasm-opt --low-memory-unused --converge --flatten --rereloop -Oz "$PANDOC_WASM_PATH" -o /pandoc.wasm

# Smoke test: convert a small Markdown file to HTML using wasmtime and the built pandoc.wasm
RUN echo '# Test Markdown' > /test.md \
  && echo 'This is a **test** document.' >> /test.md \
  && wasmtime run --dir /::/ /pandoc.wasm /test.md -o /test.html \
  && test -f /test.html
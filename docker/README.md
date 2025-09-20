# Pandoc WebAssembly (WASM)

This Docker image provides a self-contained toolchain for building the WebAssembly (WASM) version of Pandoc, the universal document converter.

The image is based on Ubuntu 22.04 and comes with:
- GHC and Cabal
- The GHC WebAssembly toolchain
- Binaryen (wasm-opt)
- Wasmtime

## Overview

The image compiles the `wasm` branch of the `haskell-wasm/pandoc` repository into a `pandoc.wasm` binary, and then optimizes the output with `wasm-opt` to reduce size.

Use this image if you want a reproducible, ready-to-run environment for producing a WASM build of Pandoc without setting up the full toolchain on your host.

## Usage: Extract the compiled binary

The primary use case is to build and copy out the optimized `pandoc.wasm` artifact.

1. Build the Docker image from this directory:
   ```bash
   docker build -t pandoc-wasm .
   ```

2. Run the container (it exits when the build finishes):
   ```bash
   docker run --name pandoc-container pandoc-wasm
   ```

3. Copy the `pandoc.wasm` file from the container to your host:
   ```bash
   docker cp pandoc-container:/pandoc.wasm .
   ```

(Optional) Clean up the stopped container:
```bash
docker rm pandoc-container
```

You now have `pandoc.wasm` available on your machine for use with any WASM runtime.

## Run pandoc.wasm locally with Wasmtime

If Wasmtime is installed on your host and you have copied `pandoc.wasm`, you can run it directly:

1. Create a sample file:
   ```bash
   echo '# Local Hello' > local.md
   ```

2. Run Pandoc (WASI):
   ```bash
   wasmtime run --dir .::/ ./pandoc.wasm local.md -o local.html
   ```

The `--dir .::/` flag grants the module access to the current directory.

## Usage: Interactive test inside the container

You can also start an interactive session in the build image to test `pandoc.wasm` without copying it out:

1. Start a shell:
   ```bash
   docker run -it --rm pandoc-wasm bash
   ```

2. Create a sample Markdown file:
   ```bash
   echo '# Test Markdown' > test.md
   ```

3. Convert using `wasmtime` and the built `pandoc.wasm`:
   ```bash
   wasmtime run --dir /::/ /pandoc.wasm /test.md -o /test.html
   ```

4. Verify the output:
   ```bash
   ls -l /test.html
   ```
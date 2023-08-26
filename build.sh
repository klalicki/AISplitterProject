#!/bin/bash

echo "Starting build"

npm install --omit=dev

pushd client
npm install --omit=dev --legacy-peer-deps
npm run build
popd

echo "Build complete"
#!/bin/bash

echo -e "\x1b[1;36mCreating frontend production build...\x1b[0m"

cd pq_dashboard/frontend && npm run build && cd ../..

echo -e "\n\x1b[1;36mCreating docker image...\x1b[0m\n"

docker build . -t pq-dashboard:v0
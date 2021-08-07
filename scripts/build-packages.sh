#!/bin/bash 

# First, make sure we have a frontend prod build
echo -e "\x1b[1;36mCreating frontend production build...\x1b[0m"

cd pq_dashboard/frontend && npm run build 

echo -e "\n\x1b[1;36mBuilding python packages with poetry...\x1b[0m\n"

poetry build
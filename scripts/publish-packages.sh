#!/bin/bash

echo -e "\x1b[1;36mCreating frontend production build...\x1b[0m"

cd pq_dashboard/frontend && npm run build && cd ../..

echo -e "\n\x1b[1;36mBuilding python packages with poetry...\x1b[0m\n"

poetry build

echo -e "\n\x1b[1;36mPublishing python packages to PyPI...\x1b[0m\n"

PYTHON_KEYRING_BACKEND=keyring.backends.null.Keyring poetry publish -v
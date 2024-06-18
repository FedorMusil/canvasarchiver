#!/bin/bash
# The initial setup for the server
# Do git clone and create a virtual environment

# git clone git@github.com:FedorMusil/canvasarchiver.git

# git remote add origin git@github.com:FedorMusil/canvasarchiver.git

# python3 -m venv venv

# Pull the latest changes from the main branch
git fetch
git pull
git checkout main
git pull

# go into the virtual environment
source venv/bin/activate
# Install any new dependencies
pip install -r requirements.txt

# Navigate to the frontend directory
cd ../frontend
# Install any new frontend dependencies
npm install
# Build the frontend
npm run build
# Navigate back to the root directory
cd ../backend

# Restart the server
pkill -f program.py

sleep 2

nohup python program.py > output.log 2>&1 &

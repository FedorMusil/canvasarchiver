#!/bin/bash
# The initial setup for the server
# Do git clone and create a virtual environment

# git clone git@github.com:FedorMusil/canvasarchiver.git

# python3 -m venv venv


# Pull the latest changes from the main branch
git checkout main
git pull

# go into the virtual environment
source venv/bin/activate
# Install any new dependencies
pip install -r requirements.txt
# Restart the server
pkill -f program.py

sleep 2

nohup python program.py > output.log 2>&1 &

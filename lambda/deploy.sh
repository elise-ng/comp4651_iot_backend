#!/bin/bash

# README
# Deployment script for deploying lambda functions locally

# exit if error occurs
set -e

# build worker docker images
faas-cli build -f stack.yml

# push images to docker repository
faas-cli push -f stack.yml

# deploy to openfaas
faas-cli deploy -f stack.yml

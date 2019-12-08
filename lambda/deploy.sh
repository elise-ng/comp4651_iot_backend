#!/bin/bash

# README
# Deployment script for deploying lambda functions locally

# exit if error occurs
set -e

# check if param exists
if [ -z $1 ]
then
    echo "Usage: $0 [dev || prod]"
    exit 1
fi

# build worker docker images
faas-cli build -f stack_$1.yml

# push images to docker repository
faas-cli push -f stack_$1.yml

# deploy to openfaas
faas-cli deploy -f stack_$1.yml

#!/bin/bash

# README
# Bootstrap script for setting up development environment
# Prerequisites: kubernetes and k3sup

# exit if error occurs
set -e

# install openfaas
echo "Installing openfaas..."
k3sup app install openfaas # installs into openfaas and openfaas-fn namespaces

# install mongodb
echo "Installing mongodb..."
k3sup app install chart --repo-name stable/mongodb --namespace mongodb

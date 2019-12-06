#!/bin/bash

# README
# Bootstrap script for setting up development environment
# Prerequisites: minikube and k3sup

# exit if error occurs
set -e

# start minikube
echo "> Starting minikube..."
minikube start

# install mongodb
echo "> Installing mongodb..."
k3sup app install chart --repo-name stable/mongodb --namespace mongodb

# install openfaas
echo "> Installing openfaas..."
k3sup app install openfaas # installs into openfaas and openfaas-fn namespaces
echo "> Follow instructions above to access openfaas"

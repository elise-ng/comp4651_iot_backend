#!/bin/bash

# README
# Bootstrap script for setting up development environment
# Prerequisites: minikube and k3sup

# exit if error occurs
set -e

# start minikube
echo "> Starting minikube..."
minikube start

# install openfaas
echo "> Installing openfaas..."
k3sup app install openfaas # installs into openfaas and openfaas-fn namespaces

# install mongodb
echo "> Installing mongodb..."
k3sup app install chart --repo-name stable/mongodb --namespace mongodb

# install faas-cli
echo "> Installing faas-cli..."
curl -SLsf https://cli.openfaas.com | sudo sh

# Forward the gateway to your machine
echo "> Forwarding openfaas port to localhost..."
kubectl rollout status -n openfaas deploy/gateway
kubectl port-forward -n openfaas svc/gateway 8080:8080 &

# If basic auth is enabled, you can now log into your gateway:
echo "> Setting up faas-cli..."
PASSWORD=$(kubectl get secret -n openfaas basic-auth -o jsonpath="{.data.basic-auth-password}" | base64 --decode; echo)
echo -n $PASSWORD | faas-cli login --username admin --password-stdin

# Finish
echo "Setup finished, openfaas available on http://127.0.0.1:8080 with password $PASSWORD"

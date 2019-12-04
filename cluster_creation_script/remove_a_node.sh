## on master side
kubectl drain <node-name> --ignore-daemonsets --delete-local-data
kubectl delete node <node-name>

## on node side
sudo kubeadm reset
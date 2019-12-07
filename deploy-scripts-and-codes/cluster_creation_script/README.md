## To create a singal Master Node k8s cluster

The steps only create a single master node kubernetes cluster, so it may not be able to have fault tolerant if the master node goes down. For a better cluster, check [Highly-Available-K8s-Cluster](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/high-availability/)

### [master.sh](./master.sh) contains the script to be run in master node

### [slave.sh](./slave.sh) contains the script to be run in slave nodes

### [remove_a_node.sh](./remove_a_node.sh) describe how to remove a node from cluster

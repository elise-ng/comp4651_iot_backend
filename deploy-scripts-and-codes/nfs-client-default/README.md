# Create a dynamic persistent volumn provisioner

Since K8s run pods(docker images) in each nodes to provide service, so when the pod goes down, then the storage of that pod will gone, so there should be some external storage to provide database service, Persistent Volumn is one solution to that.

Here describe the steps to create a dynamic persistent volumn provisioner in k8s cluster by using NFS.

## Steps:

### (Optional)1. Create a new instance with large enough disk space

### 2. Install nfs-server in the created/selected machine (Ubuntu work as follow)
```
sudo apt-get install nfs-kernel-server
```

### 3. Specify the directory to be exposed/shared
```
# suppose /srv/nfs/kubedata will be the directory to expose
sudo mkdir -p /srv/nfs/kubedata
sudo chmod -R 777 /srv/nfs

# 1. Add the permissions to specific ips by editing file /etc/exports, add the following line
/srv/nfs/kubedata <node-ip-1>(rw,sync,no_subtree_check,no_root_squash,no_all_squash) <node-ip-2>(rw,sync,no_subtree_check,no_root_squash,no_all_squash)

# 2. Or add permission to all ips
/srv/nfs/kubedata *(rw,sync,no_subtree_check,no_root_squash,no_all_squash) 

# update the edit permissions
sudo exportfs -rav
```

### 4. Install nfs-common on access nodes (the nodes that are going to use the exposed directory above)
```
sudo apt-get install nfs-common
```


### 5. (Optional)Login to access nodes to test the mount
```
# go to access node
ssh <access-node>

# mount remote dir to /mnt
sudo mount -t nfs <storage-ip>:/srv/nfs/kubedata /mnt

# touch a file
touch /mnt/testing.txt

# check in the storage-machine to see the testing.txt, if appears then success 
ls /srv/nfs/kubedata/ ## storage-node operation

# umount in access node
cd ~
sudo umount /mnt
```

### 6. Download yaml files from [nfs-client-provisioner](https://github.com/kubernetes-incubator/external-storage/tree/master/nfs-client/deploy)
```
# Run the command in Master Node!!

# create roles
kubectl create -f rbac.yaml

# create storage class (edit if to make it as default)
kubectl create -f class.yaml

# create the deployment
kubectl create -f deployment.yaml

# test file
# 1. create test persistent volumn claim
kubectl create -f test-claim.yaml
# 2. create a pod to use the persistent volumn
kubectl create -f test-pod.yaml

## if /srv/nfs/kubedata/.../SUCCESS appears in storage machine,
## then the setup is success

# clean the testing file
kubectl delete -f test-pod.yaml
kubectl delete -f test-claim.yaml
```
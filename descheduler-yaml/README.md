## Configure descheduler in a k8s cluster
Descheduler helps to balance pod distribution among all the nodes.

Here is the [sample](./sample-deploy) yaml files to install and test


###Steps to apply the descheduler

####1. Create permission to allow delete pods
```
kubectl create -f rbac.yaml
```

####2. Create policy to redistribute pods
```
kubectl create -f configmap.yaml
```

####3. Create cronjob/job to regularly do the checking(specify the policies inside cronjob.yaml)
```
kubectl create -f cronjob.yaml
```

####4. (Optional) Create deployment to test the descheduler
Steps:
1. Only Keep in Node in the cluster
2. Create the deployment
```
kubectl create -f deployment-test.yaml
```
3. Create one more node in the cluster
4. Check the pods is redistributed from one node to two node
```
kubectl get pods -A -o wide
```

# Deploy mongodb in k8s cluster

#### Prerequsite:
* Installed a dynamic persitent volumn provisioner
* Set the dynamic PV provisioner as default storage class

## Steps:
### 1. Prepare yaml two yaml files [file1](./headless-service.yaml) [file2](./mongodb-statefulset.yaml)

### 2. Create a headless service
```
kubectl create -f headless-service.yaml
```

### 3. Create a stateful set
```
kubectl create -f mongodb-statefulset.yaml
```

### 4. Login to one mongodb instance to do initialization
```
#login and run mongo
kubectl exec -it mongo-0 -- mongo

# init replica set
rs.initiate()

# do config
var cfg = rs.conf()
cfg.members[0].host="mongo-0.mongo:27017"
rs.reconfig(cfg)

# add other replicas manually
rs.add("mongo-1.mongo:27017")
rs.add("mongo-2.mongo:27017")
```

### 5. (Optional) Scale the mongo replica-set
```
kubectl scale sts mongo --replicas 4
# login to primary node, and add manually
rs.add("mongo-<num>.mongo:27017")
```

### 6. Connection URL to the mongo replica-set
```
mongodb://mongo-0.mongo.default.svc.cluster.local,mongo-1.mongo.default.svc.cluster.local,mongo-2.mongo.default.svc.cluster.local,...
```


#### Functions to be included in future
* auto add mongo newly created nodes
* auto create/delete mongoDB instance to fit the traffic
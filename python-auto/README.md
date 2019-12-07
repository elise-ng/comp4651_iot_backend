##Python Script to auto mange the nodes

The [script](./python-auto.py) is responsible to check all the nodes' CPU average utilization and determines to create/delete slave node in the cluster.

##Prerequisite
* installed aws-cli
* login/store credential using aws-cli such that aws-cli has the FULL permission on AWS EC2

####Functions supported currently
* automatically start one node in the cluster when over usage of current cluster
* automatically select one node to be terminated when under usage of current cluster

####Functions to be included in future
* include more metrics other than CPU
* dynamically get the connection token to join a cluster instead of included in a instanceTemplate in AWS
* build the script into a docker image so the monitoring tool can be run as a pod in the cluster


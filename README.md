# COMP4651 Project - Serverless IoT Backend

|Name|SID|ITSC|GitHub|
|----|---|----|------|
|Ng Chi Him|20420921|chngax|chihimng|
|Leung Lai Yung|20422412|lyleungad|Benker-Leung|
|Lee Pan Yin|20258366|pyleeag|fredlee3107|

[Link to GitHub Repo](https://github.com/Benker-Leung/comp4651_iot_backend)

## Background
Serverless architecture offers great scalability and flexibility for programmers, in that development of the business logic can be focused on, while the deployment and server maintainence work are offloaded to the framework. As both of our FYP are related to IoT devices, where the number of requests to backend fluctuates and system availability is of paramount importance, a serverless backend service is greatly beneficial where it is very scalable. This can also help reduce the cost of maintainence since server instances can be created and set up automatically.

![](https://i.imgur.com/gkCgDCi.jpg =500x)

## Development of web APIs as lambda functions on OpenFaaS
This section covers the process of developing web APIs as lambda functions with OpenFaaS from a backend developer standpoint. We will explain the technology stack used, our api design and database schema and finally the work flow of development.

For our project, API endpoints were developed for client apps or IoT devices to access or change records stored on a document-based database. In particular, four lambda functions were built to handle CRUD operations of the `user` document.

### Technology Stack and Deployment Flow

In contrast to AWS Lambda, which accepts and runs handler scripts directly, OpenFaaS packages the script as Docker images for execution. With this approach, lambda function code have to be built into Docker images, pushed onto a container registry and finally pulled and run by workers pods on the server. To facilitate this deployment flow, OpenFaaS provides a CLI tool `faas-cli` for developers to execute each action from their machine.


![](https://i.imgur.com/9sEeio2.png =500x)

As denoted in the diagram above, we used NodeJS to write handler functions and Docker Hub to host built images.


### API and Data Structure Design

Considered that API and database schema design is not a focus of this course, we will not explain our design in detail. Information here is for you to follow our code more easily.

As mentioned above, four endpoints are available for executing CRUD operations on `user` records. They accept requests and respond with a `success` boolean flag and updated record content in JSON format, as well as using correct HTTP status codes to denote result of execution.

Please refer to the [API documentation here](https://documenter.getpostman.com/view/8525618/SWE56ysT) on endpoint urls, sample requests and responses.

For data structure, as data in IoT systems are often hierarchical and related to one user account only, we used MongoDB --- a document-based database --- to store our data. The schema of a `user` object is as followed:

```jsonld=
{
    "user": {
        "email": "test@test.com",
        "devices": [],
        "groups": [],
        "locations": [],
        "passwordHash": "123456",
        "profile": {
            "firstName": "Hello",
            "lastName": "World"
        }
    }
}
```

### Development Workflow

> Refers to `lambda` folder on our code repo, please read `lambda/README.md` for description of directories and files

This part describes the steps to replicate and test our work on your local machine.

#### Setting Up a Development Environment Locally

##### Prerequisites

Here, we expect that `Docker Desktop` is installed with a `Docker Hub` account logged in. This is so that we can build docker images and upload them to the docker hub repository.

Please also install `Minikube`, a tool for running kubernetes locally, and `k3sup`, a tool for quick installation of `Helm` charts onto the local cluster.

##### Install required tools
> Refers to bootstrap script (lambda/bootstrap_dev_env)

For easier development, we set up a local single-node kubernetes cluster providing OpenFaaS and MongoDB services. Ports are forwarded to localhost for debug purposes.

Our bootstrap script is written to be ran on macOS, with `minikube` and `k3sup` installed. It might also work on other OSes such as Linux as long as they are supported by the forementioned tools.

After running the script, `faas-cli` tool will be installed and authenicated for controlling the OpenFaaS instance at `127.0.0.1:8080`. On the other hand, the mongodb instance can be accessed at `127.0.0.1:27017` with the root account `root:root`.

##### Setup MongoDB database
Please create a `iot_backend` database with `users` collection as well as a `lambda:lambda` account with `readWrite` access to that database.

If other values are used, please update the `mongo_url` and `mongo_dbname` configurations on `stack_dev.yml`

To do so with command line,
```shell=
# Open sheel on mongodb instance
kubectl exec -it -n mongodb svc/mongodb bash

# Execute MongoDB CLI Client
mongo

# Login and create new user
db.auth('root', 'root')
use admin
db.createUser({user:"lambda", pwd:"lambda", roles:[{role: "readWrite", db: "iot_backend"}]})

# Create new database and collection
use iot_backend
db.createCollection("users")
```

#### Event Handler Development

> Refers to handler.js in the four function folders

To develop lambda functions with NodeJS, we make use of the `node12` community-maintained template, which provides an `event` object containing data of incoming requests and a `context` object for receiving response to be sent back. The usage of the template is available [here](https://github.com/openfaas-incubator/node10-express-template).


To create a new function,
```shell=
faas-cli new demo --lang node12 -a stack_dev.yml
```

#### Testing and Debugging Locally

> Refers to deployment script (lambda/deploy.sh)

After the script is written, we build, push and deploy docker image with the `faas-cli` tool. We have created a shortcut script for easier re-deployment during debugging process.

```shell=
./deploy.sh dev
```

Before the docker image can be uploaded, you need to update the `image` fields on `stack_dev.yml` so your Docker Hub username is used instead of ours.

As OpenFaaS may not pull `latest` tag every time, we need to specify and increment the version number tag if changes were made, so that the new changes are always applied.

After deployment, api endpoints will be available on `http://127.0.0.1:8080/function/{function name}`. Please refer to our [API documentation](https://documenter.getpostman.com/view/8525618/SWE56ysT) for details if you wish to test them.

#### Deployment to Production Environment

Similar to above, after we hosted a production environment as described in the next section, we created a `stack_prod.yml` based on the previuos `stack_dev.yml` with modifications such as updated OpenFaaS and MongoDB endpoints, as well as scaling configurations.

After loggin into the production environment with `faas-cli login`, we can use the deployment script again:

```shell=
./deploy.sh prod
```

## Hosting on a Scalable Cluster for Production

To host a production instance of OpenFaaS and MongoDB, we built a scalable cluster with kubernetes (k8s). Serval open-source tools were used, which will be explained in the section below with details.

### 1. Calico
This is a network interface plug-in to kubernetes cluster to provide container networking, which enables containers to talk to each other. The implementation details are in [here](https://docs.projectcalico.org/v3.10/getting-started/kubernetes/)

### 2. NFS Client Provisioner
This is an automatic persistent volume provisioner in the cluster, which provides permanent storage to the some container, such as Database services. The implementation details are in our [GitHub-Page](https://github.com/Benker-Leung/comp4651_iot_backend/tree/master/deploy-scripts-and-codes/nfs-client-default).


### 3. Descheduler
This is a "pod load balancer". It will automatically delete the pods in "heavy nodes" which has high CPU usage or contains a lot of pods in that node, and the kubernetes cluster itself will recreate the deleted pods under this case. The implementation details are in our [GitHub-Page](https://github.com/Benker-Leung/comp4651_iot_backend/tree/master/deploy-scripts-and-codes/descheduler-yaml).

### 4. MongoDB
We used MongoDB as our database storage in this case. It natively provides a high availability by creating the mongoDB replica set, so when one mongoDB container is down, another one will be able to take its job. And more mongoDB instance can help to load-balance the "read-only" requests. The implementation details are in our [GitHub-Page](https://github.com/Benker-Leung/comp4651_iot_backend/tree/master/deploy-scripts-and-codes/mongodb-yaml).

### 5. Python-Script
Since we are building a k8s cluster directly on EC2 instances, the script helps to automatically create/delete the node from k8s cluster, and also from EC2, according to the average CPU utilization of all existing slave nodes. The script can be found in our [GitHub-Page](https://github.com/Benker-Leung/comp4651_iot_backend/tree/master/deploy-scripts-and-codes/python-auto).


### How auto-scaling work in our system?
The most important part in serverless system is auto scaling on demand. In our kubernetes cluster, there are two components need to be scaled, 1. __pods__ and 2. __slave nodes__. OpenFaaS already supported the scaling of __pods__ according to the number of request to a function. For slave nodes, we implemented a [python script](https://github.com/Benker-Leung/comp4651_iot_backend/tree/master/deploy-scripts-and-codes/python-auto) to automatically start instance in EC2 via "boto3", and the newly started instance will automatically join the existing k8s cluster. Currently we used average CPU utilization of all nodes to determine the workload, for example we set the value is 65, which means if the average CPU utilization is over 65%, then a node will be created and join the cluster. Similarly, to auto scale down, if the average CPU utilization is below 20%, then we will only delete those nodes are automatically created by the script, so as to maintain a minimal number of nodes even average CPU utilization is low.

## Discussion

### Developer Experience with using OpenFaaS

Our experience with OpenFaaS was not smooth. Although the `faas-cli` tool simplified a lot of deployment work from a developer standpoint, it has quite a steep learning curve due to unorganized documentations and CLI-centric tools. For example, its docker based deployment flow was not explained clearly on their site and makes it hard for developers with experience on other serverless platform to switch over. In comparison, AWS Lambda provides a fully-fledged GUI web panel for management, as well as good documentation and sample projects to guide developers.

Moreover, the community-maintained templates are quite restrictive and sometimes behaive unexpectedly. In particular, we had to use `.succeed()` block to send error responces because the `.fail()` block overrides the HTTP headers and content type we specified. The template is poorly documented which increased the diffculty of solving such issues and made development even harder.

These complaints being said, the flexibility provided by the docker-based design is tremendous, where the ecosystem could support lambda functions written in virutally any language if a template is developed by the community. While this approach complicates the deployment process and introduces overhead in both buildtime and runtime, these compromises could be good tradeoffs for a versitile serverless execution framework.

### Developer Experience with setting up k8s cluster

There are many concepts to learn, such as pod, replica set, service, deployment etc in k8s need to be clearly understood. We are setting up the kubernetes cluster from scratch so it is the most complicated way. However, there exist some tools such as __kops__ which can help to setup the cluster in EC2, or the most simple way is to directly use the cluster which provided by cloud provider, such as AWS EKS.

### Futher Improvements to Our Work

First and foremost, with the lack of proper user autheication and access control mechanisms, our API is not production-ready at all. For authenication, we can make use of the API Gateway module of OpenFaaS which provides OAuth2 support. For access control, middleware can be added before the execution of lambda functions to check if request to a data record comes from the owner or other approved users.

Secondly, our API endpoints do not follow RESTful guilelines and may be hard to work with. To improve the experience, we can make use of a proxy to map GET, POST, PUT and DELETE requests to the respecitve CRUD lambda functions, and accept user id selector in the request url, instead of using the default endpoints provided by OpenFaaS.

Lastly, more lambda functions can be implemented to further ease the development of client applications, such as endpoints for updating records of a particular IoT device. On the other hand, database triggers can be implemented so that lambda functions can be invoked to react to data changes instantly, so as to provide features such as alerts or smart-home behaviors.

### Demo

To demo our serverless IoT backend system, we have created a scalable cluster with AWS EC2 instances and deployed our lambda functions to the OpenFaaS instance hosted on that cluster. The functions are configured to scale automatically by OpenFaaS. API requests were made to test that our lambda functions execute correctly.

The picture shows that all the pods running to support the four functions.
![](https://i.imgur.com/91gG2Ou.png =500x)

[more demo](https://github.com/Benker-Leung/comp4651_iot_backend/tree/master/auto-scaling-demo)

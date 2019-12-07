# Lambda Functions

This folder contains the code of our lambda functions, as well as scripts and configurations necessary to replicate our work locally.

Please refer to our project report for usage.

## File Structure and description

Only important files are included.

```
lambda
│   README.md
|   bootstrap_dev_env.sh --- script for setting up development environment
|   deploy.sh --- script for building, uploading and deploying functions
|   stack_dev.yml --- configuration file for deployment to development environment
|   stack_prod.yml --- configuration file for deployment to production environment
│   ...
|
└───createuser
│   │   handler.js --- hander code
│   │   ...
│
└───deleteuser
│   │   handler.js --- hander code
│   │   ...
|
└───getuser
│   │   handler.js --- hander code
│   │   ...
|
└───updateuser
    │   handler.js --- hander code
    │   ...
```

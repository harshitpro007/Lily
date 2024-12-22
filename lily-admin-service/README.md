# Admin-Service

## Index
- [Project Overview](#Overview-Project)
- [Basic Setup](#Prerequisite)
- [Environment.](#Environment)
- [run build on server](#Scripts)
- [run Locally your project](#locally-in-your-project)
- [Folder Structure](#Folder-Structure)
- [localhost swagger URL](#localhost-swagger-url)
- [Base Project Architechture](#base-project-architechture)
    - [Controllers](#controllers)
    - [Models](#models)
    - [Services](#services)
    - [Utils](#utils)

## Overview-Project
Lily Admin service developed in HapiJs framework with Typescript for web platform.
This project is based on micro service  architecture which we find user onboarding process, is built in hapi js framework.

## Prerequisite

- ***Redis Server*** - In your system redis server should be up and running
- ***MongoDb*** - In your system MongoDb server >=6.x should be up and running
- ***NodeJs*** - In your system NodeJS >= 20.X should be up and running


- ***Install dependency*** - Run npm install to install all dependency
```
npm install 
```
## Environment 
- ***Setup Environment*** - Create a file in your root folder by name .env.local with following details 

## Scripts 
```
    "prestart": "tsc",
    "local": " tsc && NODE_ENV=local node ./build/server.js",
    "watch": "tsc --watch",
    "development": "tsc && NODE_ENV=development node ./build/server.js",
    "nodemon": "NODE_ENV=local nodemon --exec ts-node -- server.ts",
    "sc": "node_modules/sonar-scanner/bin/sonar-scanner"
```

## Folder-Structure

```
Folder structure:-
 src
    ├── config
    ├── interfaces
    ├── json
    ├── lib
    │   └── redis
    ├── modules
    │   ├── baseDao
    │   ├── loginHistory
    │   │   └── v1
    │   └── admin
    │       └── v1
    ├── plugins
    ├── routes
    ├── uploads
    ├── utils
    └── views
```

## locally-in-your-project
```
npm run local 
```
# localhost swagger URL

- http://localhost:3000/admin/documentation

### Basic Setup End

## Base Project Architechture
This project is configured according to component based structure.

# Library
This directory contains all external services used throughout the application

# Modules
This directory contains all different modules used in our application for developing Controllers,Routes,Dao & Models.

# Controllers
These files define business logic throughout the application.

# DAO
These files define data access layer throughout the application.

# Models
These files define logical structure of a database throughout the application.

# Routes
These file contains all the endpoint throughout the application

# Utils
This directory contains all the utitilies and classes used by the application.


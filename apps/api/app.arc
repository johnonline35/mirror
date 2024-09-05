@app
mirror-api

@aws
region us-east-1
profile default
runtime nodejs20.x
architecture x86_64
memory 2048
timeout 900

@http
/*
  method any
  src server

@buckets
staging staging-api-lambda-bucket
production production-api-lambda-bucket

@static
prune true

@plugins
warmer-plugin
  src arc/warmer-plugin

@staging
lambda staging-api-lambda-function
bucket staging-api-lambda-bucket

@production
lambda production-api-lambda-function
memory 3008
timeout 900
production production-api-lambda-bucket


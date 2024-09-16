@app
puppeteer-api

@aws
region us-east-1
profile default
runtime nodejs20.x
architecture x86_64
memory 2048
timeout 720

@http
/*
  method any
  src server

@buckets
staging staging-puppeteer-lambda-bucket
production production-puppeteer-lambda-bucket

@static
prune true

@plugins
warmer-plugin
  src arc/warmer-plugin

@staging
lambda staging-puppeteer-lambda-function
bucket staging-puppeteer-lambda-bucket

@production
lambda production-puppeteer-lambda-function
memory 3008
timeout 900
production production-puppeteer-lambda-bucket


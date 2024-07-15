@app
mirror-data

@aws
region us-east-1
profile default
timeout 30

@http
/*
  method any
  src server

# @static
# prune true

# @plugins
# warmer-plugin
#   src arc/warmer-plugin
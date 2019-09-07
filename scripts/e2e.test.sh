#!/bin/bash

# Set environment variables from .env and set NODE_ENV to test
export $(cat .env | grep -v "^#" | xargs)
export NODE_ENV=test

# Make sure the port is not already bound
if ss -lnt | grep -q :$SERVER_PORT_TEST; then
   echo "Another process is already listening to port $SERVER_PORT_TEST"
   exit 1;
fi

RETRY_INTERVAL=${RETRY_INTERVAL:-0.2}

# start Elasticsearch if not running
if ! systemctl is-active --quiet elasticsearch.service; then
   sudo systemctl start elasticsearch.service
   
   # Clean the test index (if it exists)
   until curl --silent -o /dev/null -X DELETE "$ELASTICSEARCH_HOSTNAME:$ELASTICSEARCH_PORT/$ELASTICSEARCH_INDEX_TEST"; do
      sleep $RETRY_INTERVAL
   done
fi

# Run our API server as a background process
yarn run serve &

# Wait until it run
until ss -lnt | grep -q :$SERVER_PORT_TEST; do
   sleep $RETRY_INTERVAL
done

# Run the test in the background
cucumber-js spec/cucumber/features --require-module @babel/register --require spec/cucumber/steps

# Terminate all processes within the same process group by sending a SIGTERM signal
kill -15 0

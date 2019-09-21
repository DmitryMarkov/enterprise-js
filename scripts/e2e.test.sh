#!/bin/bash

# Make sure the port is not already bound
# if ss -lnt | grep -q :$SERVER_PORT; then
#    echo "Another process is already listening to port $SERVER_PORT"
#    exit 1;
# fi

RETRY_INTERVAL=${RETRY_INTERVAL:-0.2}

# start Elasticsearch if not running
# if ! systemctl is-active --quiet elasticsearch.service; then
#    sudo systemctl start elasticsearch.service
   
#    # Wait until Elasticsearch is ready to respond
#    until curl --silent $ELASTICSEARCH_HOSTNAME:$ELASTICSEARCH_PORT -w "" -o /dev/null; do
#       sleep $RETRY_INTERVAL
#    done
# fi

# Clean the test index (if it exists)
# curl --silent -o /dev/null -X DELETE "$ELASTICSEARCH_HOSTNAME:$ELASTICSEARCH_PORT/$ELASTICSEARCH_INDEX"

# Run our API server as a background process
yarn run serve:test &

# Wait until it run
until ss -lnt | grep -q :$SERVER_PORT; do
   sleep $RETRY_INTERVAL
done

# Run the test in the background
npx cucumber-js spec/cucumber/features --require-module @babel/register --require spec/cucumber/steps --tags "not @ignored"

# Terminate all processes within the same process group by sending a SIGTERM signal
if [[ -z $TRAVIS_COMMIT && -z $JENKINS ]]; then
  kill -15 0
fi

exit 0

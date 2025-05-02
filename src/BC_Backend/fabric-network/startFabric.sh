#!/bin/bash

# Start the network
docker-compose -f docker-compose.yaml -f docker-compose.override.yaml up -d 
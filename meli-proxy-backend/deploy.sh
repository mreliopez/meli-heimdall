#!/bin/bash
REMOTE_IP="200.80.28.114"
REMOTE_PORT="5000"
REMOTE_USER="ticpro"
REMOTE_LOCATION="api/"
LOCAL_FILES="config package-lock.json package.json server.js"

scp -P$REMOTE_PORT -r $LOCAL_FILES $REMOTE_USER@$REMOTE_IP:$REMOTE_LOCATION

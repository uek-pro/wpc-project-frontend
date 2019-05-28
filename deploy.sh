#!/bin/bash

npm run build; echo "Zbuildowano!"

aws s3 cp ./dist/index.html \
    s3://185777/index.html \
    --acl=public-read

aws s3 cp ./dist/main.bundle.js \
    s3://185777/main.bundle.js \
    --acl=public-read
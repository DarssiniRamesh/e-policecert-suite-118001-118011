#!/bin/bash
cd /home/kavia/workspace/code-generation/e-policecert-suite-118001-118011/epcc_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


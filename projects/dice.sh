#!/bin/bash
'cd' '/apps/mg-games'
'docker-compose' 'down'
'git' 'pull'
'docker-compose' 'build'
'docker-compose' 'up' '-d'
#!/bin/bash
'cd' '/proj/cv'
'docker-compose' 'down'
'git' 'pull'
'docker-compose' 'build'
'docker-compose' 'up' '-d'
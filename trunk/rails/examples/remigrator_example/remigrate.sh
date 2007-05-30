#!/bin/sh
# setting RAILS_ROOT and change directory
RAILS_ROOT=/home/rails/okamoto_test/remigrator_example
cd $RAILS_ROOT
echo "migrate down... "
eval rake db:migrate VERSION=0
echo "-----END-------"
echo "migrate up... "
eval rake db:migrate
echo "-----END-------"
exit

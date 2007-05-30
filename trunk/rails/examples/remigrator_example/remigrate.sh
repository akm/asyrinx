#!/bin/sh
# setting RAILS_ROOT and change directory
RAILS_ROOT=/home/rails/okamoto_test/remigrator_example
cd $RAILS_ROOT
echo "migrate down... "
eval rake db:migrate VERSION=0 RAILS_ENV=test
echo "-----END-------"
echo "migrate up... "
eval rake db:migrate RAILS_ENV=test
echo "-----END-------"
exit

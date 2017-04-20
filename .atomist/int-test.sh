#!/usr/bin/env sh

set -e
set -x

echo "Running a bunch of rugs in succession"

project_parent_dir=$(mktemp -d)
project_name="banana"

# todo: tell Christian that -C doesn't work anymore unless it's at the end.
rug -loR generate NewRestService $project_name -C $project_parent_dir

project_dir=$project_parent_dir/$project_name

rug -loR edit AddRestEndpoint returnedClass=Peel fieldName=color fieldType=String -C $project_dir

cd $project_dir
mvn test
cd -
rm -rf $project_parent_dir
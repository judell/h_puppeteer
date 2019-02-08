#!/bin/sh

# Create a production build of the client with a given OAuth client ID
#
# Usage:
#
# ./build $OAUTH_CLIENT_ID
#
# $OAUTH_CLIENT_ID - The OAuth client ID registered with the "h" service.
#
# After running this script, you will need to upload the contents of the "build"
# dir to the location that the client will be served from.

set -eu

export NODE_ENV=production
export OAUTH_CLIENT_ID=472a4926-a306-11e7-8b1b-eb37720ea07c

# Remove any outputs from previous builds.
rm -rf build/

gulp build
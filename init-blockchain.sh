#!/bin/bash

osascript -e 'tell app "Terminal"
do script "geth -datadir=/Users/TylerGentile/Documents/GitHub/HAZMAT/privatechain/chaindata"
end tell'

osascript -e 'tell app "Terminal"
do script "geth attach ipc:/Users/TylerGentile/Documents/GitHub/HAZMAT/privatechain/chaindata/geth.ipc"
end tell'

osascript -e 'tell app "Terminal"
do script "/Applications/Mist.app/Contents/MacOS/Mist --rpc /Users/TylerGentile/Documents/GitHub/HAZMAT/privatechain/chaindata/geth.ipc"
end tell'

osascript -e 'tell app "Terminal"
do script "/Users/TylerGentile/Documents/GitHub/HAZMAT/node_modules/.bin/testrpc"
end tell'
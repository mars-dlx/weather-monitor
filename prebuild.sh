COMMIT=`git rev-parse --short HEAD`
TIMESTAMP=`date +%s`

mkdir -p dist
echo "{\"version\": \"$COMMIT\",\"build_date\": \"$TIMESTAMP\"}" > ./dist/version.json


tsc --module commonjs --target es5 ./lib/index.ts ./test/test-index.ts
echo "typescript compiled."
typedoc --out "./doc" --name "timezonecomplete" --module commonjs --target es5 --excludeExternals ./lib/index.ts

tsc --module commonjs --target es5 --declaration ./lib/index.ts ./test/test-index.ts
echo "typescript compiled."
node ./dts.js
echo "declarations bundled."
typedoc --out "./doc" --name "timezonecomplete" --module commonjs --target es5 --excludeExternals ./lib/index.ts
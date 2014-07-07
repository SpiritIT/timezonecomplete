var dts = require('dts-bundle');

dts.bundle({
    name: 'timezonecomplete',
	baseDir: 'lib',
	externals: false,
    main: 'lib/index.d.ts'
});
require.config({
    baseUrl: '.',
    paths: {
        timezonecomplete: 'timezonecomplete'
    }
});

require(['timezonecomplete'], function(tc) {
	var utc = tc.nowUtc();
	var local = utc.toZone(tc.zone('localtime'));
	var diff = local.toZone(null).diff(utc.toZone(null));
	var hourDiff = tc.hours(diff.hours());
	
	document.getElementById('utc').textContent = utc.format('dd-MMM-yyyy HH:mm:ss');
	document.getElementById('local').textContent = local.format('dd-MMM-yyyy HH:mm:ss');
	document.getElementById('diff').textContent = hourDiff.toString();
});

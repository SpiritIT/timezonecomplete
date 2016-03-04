/**
 * Copyright(c) 2016 Spirit IT BV
 */

"use strict";

function assert(condition: any, message: string): void {
	if (!condition) {
		throw new Error(message);
	}
}

export default assert;

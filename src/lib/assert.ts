/**
 * Copyright(c) 2016 ABB Switzerland Ltd.
 */

"use strict";

import { throwError } from "./error";

/**
 * Throws an Assertion error if the given condition is falsy
 * @param condition
 * @param name error name
 * @param message error message with percent-style placeholders
 * @param args arguments for error message format string
 * @throws [name] if `condition` is falsy
 */
function assert(condition: any, name: string, message: string): asserts condition {
	if (!condition) {
		throwError(name, message);
	}
}

export default assert;

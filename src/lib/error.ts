/**
 * Copyright (c) 2019 ABB Switzerland Ltd.
 */

/**
 * Throws an error with the given name and message
 * @param name error name, without timezonecomplete prefix
 * @param message message with percent-style placeholders
 * @param args arguments for the placeholders
 * @throws the given error
 */
export function throwError(name: string, message: string): never {
	const error = new Error(message);
	error.name = "timezonecomplete." + name;
	throw error;
}

/**
 * Returns an error with the given name and message
 * @param name
 * @param format
 * @param args
 * @throws nothing
 */
export function error(name: string, message: string): Error {
	const error = new Error(message);
	error.name = "timezonecomplete." + name;
	return error;
}

/**
 * Returns true iff `error.name` is equal to or included by `name`
 * @param error
 * @param name string or array of strings
 * @throws nothing
 */
export function errorIs(error: Error, name: string | string[]): boolean {
	if (typeof name === "string") {
		return error.name === "timezonecomplete." + name;
	} else {
		return error.name.startsWith("timezonecomplete.") && name.includes(error.name.substr("timezonecomplete.".length));
	}
}

/**
 * Converts all errors thrown by `cb` to the given error name
 * @param errorName
 * @param cb
 * @throws [errorName]
 */
export function convertError<T>(errorName: string, cb: () => T): T {
	try {
		return cb();
	} catch (e) {
		return throwError(errorName, e.message);
	}
}

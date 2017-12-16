/**
 * Copyright(c) 2017 ABB Switzerland Ltd.
 */

/**
 * Fixed day period rules
 */
export interface DayPeriod {
	am: string;
	pm: string;
	midnight: string;
	noon: string;
}

/**
 * Locale for formatting
 */
export interface Locale {
	/**
	 * Era names: AD, BC
	 */
	eraNarrow: [string, string];
	eraWide: [string, string];
	eraAbbreviated: [string, string];

	/**
	 * The letter indicating a quarter e.g. "Q" (becomes Q1, Q2, Q3, Q4)
	 */
	quarterLetter: string;
	/**
	 * The word for 'quarter'
	 */
	quarterWord: string;
	/**
	 * Quarter abbreviations e.g. 1st, 2nd, 3rd, 4th
	 */
	quarterAbbreviations: string[];

	/**
	 * Month names
	 */
	longMonthNames: string[];
	/**
	 * Three-letter month names
	 */
	shortMonthNames: string[];
	/**
	 * Month letters
	 */
	monthLetters: string[];

	/**
	 * Week day names, starting with sunday
	 */
	longWeekdayNames: string[];
	shortWeekdayNames: string[];
	weekdayTwoLetters: string[];
	weekdayLetters: string[];

	/**
	 * Fixed day period names (AM/PM/noon/midnight, format 'a' and 'b')
	 */
	dayPeriodNarrow: DayPeriod;
	dayPeriodWide: DayPeriod;
	dayPeriodAbbreviated: DayPeriod;
}


// todo this can be Partial<FormatOptions> but for compatibility with
// pre-2.1 typescript users we write this out ourselves for a while yet
export interface PartialLocale {
	/**
	 * Era names: AD, BC
	 */
	eraNarrow?: [string, string];
	eraWide?: [string, string];
	eraAbbreviated?: [string, string];

	/**
	 * The letter indicating a quarter e.g. "Q" (becomes Q1, Q2, Q3, Q4)
	 */
	quarterLetter?: string;
	/**
	 * The word for 'quarter'
	 */
	quarterWord?: string;
	/**
	 * Quarter abbreviations e.g. 1st, 2nd, 3rd, 4th
	 */
	quarterAbbreviations?: string[];

	/**
	 * Month names
	 */
	longMonthNames?: string[];
	/**
	 * Three-letter month names
	 */
	shortMonthNames?: string[];
	/**
	 * Month letters
	 */
	monthLetters?: string[];

	/**
	 * Week day names, starting with sunday
	 */
	longWeekdayNames?: string[];
	shortWeekdayNames?: string[];
	weekdayTwoLetters?: string[];
	weekdayLetters?: string[];

	/**
	 * Fixed day period names (AM/PM/noon/midnight, format 'a' and 'b')
	 */
	dayPeriodNarrow?: DayPeriod;
	dayPeriodWide?: DayPeriod;
	dayPeriodAbbreviated?: DayPeriod;
}

export const ERA_NAMES_NARROW: [string, string] = ["A", "B"];
export const ERA_NAMES_WIDE: [string, string] = ["Anno Domini", "Before Christ"];
export const ERA_NAMES_ABBREVIATED: [string, string] = ["AD", "BC"];

export const QUARTER_LETTER: string = "Q";
export const QUARTER_WORD: string = "quarter";
export const QUARTER_ABBREVIATIONS: string[] = ["1st", "2nd", "3rd", "4th"];

export const LONG_MONTH_NAMES: string[] =
	["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const SHORT_MONTH_NAMES: string[] =
	["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const MONTH_LETTERS: string[] =
	["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export const LONG_WEEKDAY_NAMES: string[] =
	["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const SHORT_WEEKDAY_NAMES: string[] =
	["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const WEEKDAY_TWO_LETTERS: string[] =
	["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const WEEKDAY_LETTERS: string[] =
	["S", "M", "T", "W", "T", "F", "S"];

export const DAY_PERIODS_ABBREVIATED = { am: "AM", pm: "PM", noon: "noon", midnight: "mid." };
export const DAY_PERIODS_WIDE = { am: "AM", pm: "PM", noon: "noon", midnight: "midnight" };
export const DAY_PERIODS_NARROW = { am: "A", pm: "P", noon: "noon", midnight: "md" };

export const DEFAULT_LOCALE: Locale = {
	eraNarrow: ERA_NAMES_NARROW,
	eraWide: ERA_NAMES_WIDE,
	eraAbbreviated: ERA_NAMES_ABBREVIATED,
	quarterLetter: QUARTER_LETTER,
	quarterWord: QUARTER_WORD,
	quarterAbbreviations: QUARTER_ABBREVIATIONS,
	longMonthNames: LONG_MONTH_NAMES,
	shortMonthNames: SHORT_MONTH_NAMES,
	monthLetters: MONTH_LETTERS,
	longWeekdayNames: LONG_WEEKDAY_NAMES,
	shortWeekdayNames: SHORT_WEEKDAY_NAMES,
	weekdayTwoLetters: WEEKDAY_TWO_LETTERS,
	weekdayLetters: WEEKDAY_LETTERS,
	dayPeriodAbbreviated: DAY_PERIODS_ABBREVIATED,
	dayPeriodWide: DAY_PERIODS_WIDE,
	dayPeriodNarrow: DAY_PERIODS_NARROW
};

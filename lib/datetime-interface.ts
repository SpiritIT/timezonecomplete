import TimeZone = require("./timezone");
import basics = require("./basics");
export interface DateTimeAccess {
	year(): number;
	month(): number;
	day(): number;
	weekDay(): basics.WeekDay;
	weekNumber(): number;
	weekOfMonth(): number;

	hour(): number;
	minute(): number;
	second(): number;
	millisecond(): number;
	dayOfYear(): number;
	secondOfDay(): number;

	zone(): TimeZone.TimeZone;
}

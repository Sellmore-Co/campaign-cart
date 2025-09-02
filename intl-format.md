Intl.NumberFormat Currency
 MDN


Input
Locale
en-US
en-AU


en-US


Currency

Australian dollar
Amount
123456.789
Alternativ use
Intl.NumberFormat can also be used from Number.prototype.toLocaleString()
const number = 123456.789
number.toLocaleString(["en-AU","en-US"])
// $123,456.79
Output
currencySign


{
	currencySign: "standard",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	currencySign: "accounting",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
currencyDisplay


{
	currencyDisplay: "code",
	style: "currency",
	currency: "AUD"
}
// AUD 123,456.79
Copy Code
{
	currencyDisplay: "symbol",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	currencyDisplay: "narrowSymbol",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	currencyDisplay: "name",
	style: "currency",
	currency: "AUD"
}
// 123,456.79 Australian dollars
Copy Code
signDisplay


{
	signDisplay: "auto",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	signDisplay: "never",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	signDisplay: "always",
	style: "currency",
	currency: "AUD"
}
// +$123,456.79
Copy Code
{
	signDisplay: "exceptZero",
	style: "currency",
	currency: "AUD"
}
// +$123,456.79
Copy Code
useGrouping


{
	useGrouping: true,
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	useGrouping: false,
	style: "currency",
	currency: "AUD"
}
// $123456.79
Copy Code
minimumIntegerDigits


{
	minimumIntegerDigits: 1,
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	minimumIntegerDigits: 2,
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	minimumIntegerDigits: 3,
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	minimumIntegerDigits: 4,
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	minimumIntegerDigits: 5,
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
minimumFractionDigits


{
	minimumFractionDigits: 1,
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	minimumFractionDigits: 2,
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	minimumFractionDigits: 3,
	style: "currency",
	currency: "AUD"
}
// $123,456.789
Copy Code
{
	minimumFractionDigits: 4,
	style: "currency",
	currency: "AUD"
}
// $123,456.7890
Copy Code
{
	minimumFractionDigits: 5,
	style: "currency",
	currency: "AUD"
}
// $123,456.78900
Copy Code
maximumFractionDigits


{
	maximumFractionDigits: 1,
	style: "currency",
	currency: "AUD"
}
// $123,456.8
Copy Code
{
	maximumFractionDigits: 2,
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	maximumFractionDigits: 3,
	style: "currency",
	currency: "AUD"
}
// $123,456.789
Copy Code
{
	maximumFractionDigits: 4,
	style: "currency",
	currency: "AUD"
}
// $123,456.789
Copy Code
{
	maximumFractionDigits: 5,
	style: "currency",
	currency: "AUD"
}
// $123,456.789
Copy Code
minimumSignificantDigits


{
	minimumSignificantDigits: 1,
	style: "currency",
	currency: "AUD"
}
// $123,456.789
Copy Code
{
	minimumSignificantDigits: 2,
	style: "currency",
	currency: "AUD"
}
// $123,456.789
Copy Code
{
	minimumSignificantDigits: 3,
	style: "currency",
	currency: "AUD"
}
// $123,456.789
Copy Code
{
	minimumSignificantDigits: 4,
	style: "currency",
	currency: "AUD"
}
// $123,456.789
Copy Code
{
	minimumSignificantDigits: 5,
	style: "currency",
	currency: "AUD"
}
// $123,456.789
Copy Code
maximumSignificantDigits


{
	maximumSignificantDigits: 1,
	style: "currency",
	currency: "AUD"
}
// $100,000
Copy Code
{
	maximumSignificantDigits: 2,
	style: "currency",
	currency: "AUD"
}
// $120,000
Copy Code
{
	maximumSignificantDigits: 3,
	style: "currency",
	currency: "AUD"
}
// $123,000
Copy Code
{
	maximumSignificantDigits: 4,
	style: "currency",
	currency: "AUD"
}
// $123,500
Copy Code
{
	maximumSignificantDigits: 5,
	style: "currency",
	currency: "AUD"
}
// $123,460
Copy Code
roundingIncrement


{
	roundingIncrement: 1,
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	roundingIncrement: 2,
	style: "currency",
	currency: "AUD"
}
// $123,456.78
Copy Code
{
	roundingIncrement: 5,
	style: "currency",
	currency: "AUD"
}
// $123,456.80
Copy Code
{
	roundingIncrement: 10,
	style: "currency",
	currency: "AUD"
}
// $123,456.80
Copy Code
{
	roundingIncrement: 20,
	style: "currency",
	currency: "AUD"
}
// $123,456.80
Copy Code
{
	roundingIncrement: 25,
	style: "currency",
	currency: "AUD"
}
// $123,456.75
Copy Code
{
	roundingIncrement: 50,
	style: "currency",
	currency: "AUD"
}
// $123,457.00
Copy Code
{
	roundingIncrement: 100,
	style: "currency",
	currency: "AUD"
}
// $123,457.00
Copy Code
{
	roundingIncrement: 200,
	style: "currency",
	currency: "AUD"
}
// $123,456.00
Copy Code
{
	roundingIncrement: 250,
	style: "currency",
	currency: "AUD"
}
// $123,457.50
Copy Code
{
	roundingIncrement: 500,
	style: "currency",
	currency: "AUD"
}
// $123,455.00
Copy Code
{
	roundingIncrement: 1000,
	style: "currency",
	currency: "AUD"
}
// $123,460.00
Copy Code
{
	roundingIncrement: 2000,
	style: "currency",
	currency: "AUD"
}
// $123,460.00
Copy Code
{
	roundingIncrement: 2500,
	style: "currency",
	currency: "AUD"
}
// $123,450.00
Copy Code
{
	roundingIncrement: 5000,
	style: "currency",
	currency: "AUD"
}
// $123,450.00
Copy Code
roundingMode


{
	roundingMode: "ceil",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	roundingMode: "floor",
	style: "currency",
	currency: "AUD"
}
// $123,456.78
Copy Code
{
	roundingMode: "expand",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	roundingMode: "trunc",
	style: "currency",
	currency: "AUD"
}
// $123,456.78
Copy Code
{
	roundingMode: "halfCeil",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	roundingMode: "halfFloor",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	roundingMode: "halfExpand",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	roundingMode: "halfTrunc",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	roundingMode: "halfEven",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
roundingPriority


{
	roundingPriority: "auto",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	roundingPriority: "morePrecision",
	style: "currency",
	currency: "AUD"
}
// $123,456.789
Copy Code
{
	roundingPriority: "lessPrecision",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
trailingZeroDisplay


{
	trailingZeroDisplay: "auto",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	trailingZeroDisplay: "stripIfInteger",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
localeMatcher


{
	localeMatcher: "best fit",
	style: "currency",
	currency: "AUD"
}
// $123,456.79
Copy Code
{
	localeMatcher: "lookup",
	style: "currency",
	currency: "AUD"
}
// $123,456.79

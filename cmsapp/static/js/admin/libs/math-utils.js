var MathUtils = new Object();

MathUtils.roundNumber = function(number, decimalPlace) {
  var newNumber = Math.round(number * Math.pow(10, decimalPlace)) / Math.pow(10, decimalPlace);
  return parseFloat(newNumber);
}
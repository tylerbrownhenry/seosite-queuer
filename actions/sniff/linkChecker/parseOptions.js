"use strict";
var defaultOptions = require("./defaultOptions");

function array2booleanMap(array){
	var i,map,numElements;
	if (Array.isArray(array) === true){
		map = {};
		numElements = array.length;
		for (i=0; i<numElements; i++){
			map[ array[i] ] = true;
		}
		return map;
	}
	return array;
}

function parseOptions(options){
	if (options == null || options.__parsed !== true){
		options = Object.assign({}, defaultOptions, options);
		options.acceptedSchemes = array2booleanMap(options.acceptedSchemes);
		options.excludedSchemes = array2booleanMap(options.excludedSchemes);
		options.__parsed = true;
	}
	return options;
}

module.exports = parseOptions;

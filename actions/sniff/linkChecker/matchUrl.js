"use strict";
var calmcard = require("calmcard");

function matchUrl(url, keywords){
	var i,numKeywords;
	
	if (url != null){
		numKeywords = keywords.length;
		
		for (i=0; i<numKeywords; i++){
            if (url.indexOf(keywords[i]) > -1){ // Check for literal keyword
				return true;
            } else if ( calmcard(keywords[i], url) === true ){ // Check for glob'bed keyword
				return true;
			}
		}
	}
	return false;
}

module.exports = matchUrl;
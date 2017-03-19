function checkErrors(response) {
     var error;
     if (response.statusCode !== 200) {
          error = new Error(errors.HTML_RETRIEVAL);
          error.code = response.statusCode;
          return error;
     }

     var type = response.headers["content-type"];

     if (type == null || type.indexOf("text/html") !== 0) { // content-type is not mandatory in HTTP spec
          error = new Error(errors.EXPECTED_HTML(type));
          error.code = response.statusCode;
          return error;
     }
}

module.exports = checkErrors;

var settings = require("../../settings/requests");

/**
 * consumer of an action request from rabbitMQ
 * @param  {object} msg content of rabbitMQ message
 */
function processAction(msg, ch) {
     settings.types.actions(msg,ch);
}
module.exports = processAction;

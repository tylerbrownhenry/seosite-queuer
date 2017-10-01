let process = require("../../settings/requests/clean_actions").init;

/**
 * consumer of an action request from rabbitMQ
 * @param  {Object} msg content of rabbitMQ message
 * @param  {Object} ch rabbitMq channel
 */
function processAction(msg, ch) {
     console.log('consume!');
     process(msg, ch);
}

module.exports = processAction;

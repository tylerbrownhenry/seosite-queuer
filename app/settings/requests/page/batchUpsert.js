/**
 * constructor for a batchPut command
 * @param {string} baseUrl     where we think the url actually points to
 * @param {string} originalUrl url found on page
 * @param {string} linkId      unique id for this url
 * @param {string} parentLink  url of page link was found on
 * @param {string} requestId   unique id of page request
 * @param {string} link        the information gather about this link and it's html element
 */
// function Command(baseUrl, originalUrl, linkId, parentLink, requestId, link,uid) {
//      return {
//           "resolvedUrl": baseUrl,
//           "url": originalUrl,
//           "_id": linkId,
//           "site": parentLink,
//           "requestId": requestId,
//           "status": 'pending',
//           "__scan": {},
//           "uid": uid,
//           "found": Date.now(),
//           "scanned": null,
//           "__link": link
//      }
// }

/**
 * constructs bulk editing commands for links
 * @param  {object} linkObj   tracks the data of links with an easy to reference object
 * @return {commands}         array of the commands to send to batchPut
 */
// function createBulkUpdateCommands(linkObj, requestId, parentLink, foundLinks, baseUrl,uid) {
//      var commands = [];
//      _.each(foundLinks, function (link) {
//           var linkId = sh.unique(link.url.original + requestId);
//           commands.push(new Command(baseUrl, link.url.original, linkId, parentLink, requestId, link,uid));
//           link._id = linkId;
//           linkObj[linkId] = link;
//      });
//      return commands;
// }
// module.exports = createBulkUpdateCommands;

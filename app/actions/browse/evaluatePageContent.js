module.exports = function () {
     var seosite_base = window.getComputedStyle(document.querySelector('body'));
     var title = document.querySelector('title').innerText;
     var all = document.getElementsByTagName("*");
     var fonts = {};
     var twitterUsername = null;
     var facebookLinkExists = null;
     var twitterLinks = document.querySelectorAll("a[href*='twitter.com']");
     var facebookLinks = document.querySelectorAll("a[href*='facebook.com']");
     if (typeof facebookLinks !== 'undefined' && facebookLinks.length > 0) {
          facebookLinkExists = true;
     }
     if (typeof twitterLinks !== 'undefined' && twitterLinks.length > 0) {
          var matches = twitterLinks[0].href.match('^https?://(www\.)?twitter\.com/(#!/)?([^/]+)(/\w+)*$');
          if (matches !== 'null' && matches[3]) {
               twitterUsername = matches[3];
          }
     }
     for (var i = 0, max = all.length; i < max; i++) {
          var fontFamily = window.getComputedStyle(all[i]).fontFamily;
          var fontName = fontFamily.split(',')[0].replace("'").replace('"', '').replace(' ', '').replace('-', '').toLowerCase();
          var font = 'ff-' + fontName;
          fonts[font] = true;
     }
     var baseSize = Number(seosite_base.fontSize)
     var baseLineHeight = Number(seosite_base.lineHeight);
     var lineHeightTooSmall = (baseSize * 1.2) > baseLineHeight;
     return {
         title: title,
          content: document.documentElement.outerHTML,
          socialInfo: {
               facebookLinkExists: facebookLinkExists,
               twitterUsername: twitterUsername,
          },
          fontInfo: {
               baseFontTooSmall: baseSize < 16,
               lineHeightTooSmall: lineHeightTooSmall,
               tooManyFonts: Object.keys(fonts).length > 4,
               fonts: Object.keys(fonts),
               baseFontSize: seosite_base.fontSize,
               baseLineHeight: seosite_base.lineHeight
          }
     }
}

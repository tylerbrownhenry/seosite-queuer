 module.exports = function () {

     if (!window || !document || typeof document.querySelector('body') !== 'object') {
          console.log('evaluatePageContent err');
          return {
               title: null,
               content: null,
               socialInfo: {},
               fontInfo: {}
          }
     }
     let seosite_base = window.getComputedStyle(document.querySelector('body')),
     title = document.querySelector('title').innerText,
     all = document.getElementsByTagName("*"),
     fonts = {},
     twitterUsername = null,
     facebookLinkExists = null,
     twitterLinks = document.querySelectorAll("a[href*='twitter.com']"),
     facebookLinks = document.querySelectorAll("a[href*='facebook.com']");
     if (typeof facebookLinks !== 'undefined' && facebookLinks.length > 0) {
          facebookLinkExists = true;
     }
     if (typeof twitterLinks !== 'undefined' && twitterLinks.length > 0) {
          let matches = twitterLinks[0].href.match('^https?://(www\.)?twitter\.com/(#!/)?([^/]+)(/\w+)*$');
          if (matches !== null && matches[3]) {
               twitterUsername = matches[3];
          }
     }
     for (var i = 0, max = all.length; i < max; i++) {
          let fontFamily = window.getComputedStyle(all[i]).fontFamily,
          fontName = fontFamily.split(',')[0].replace("'").replace('"', '').replace(' ', '').replace('-', '').toLowerCase(),
          font = 'ff-' + fontName;
          fonts[font] = true;
     }
     let baseSize = Number(seosite_base.fontSize),
     baseLineHeight = Number(seosite_base.lineHeight),
     lineHeightTooSmall = (baseSize * 1.2) > baseLineHeight;
     return {
          title: title,
          vars : Object.getOwnPropertyNames(window),
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

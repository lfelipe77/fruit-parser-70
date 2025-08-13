(function () {
  try {
    var loc = window.location;
    var isCallback = loc.pathname.startsWith('/auth/callback');
    var hasHash = !!loc.hash;
    var isRoot = loc.pathname === '/';
    var alreadyHashPath = loc.pathname.startsWith('/#');

    // Only rewrite to /#/... when it's NOT the OAuth callback
    if (!isCallback && !hasHash && !isRoot && !alreadyHashPath) {
      var path = loc.pathname + loc.search + loc.hash;
      var newUrl = loc.origin + '/#' + path.replace(/^\//, '');
      loc.replace(newUrl);
    }
  } catch (_) { /* diagnostics only */ }
})();

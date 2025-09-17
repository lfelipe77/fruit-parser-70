(function () {
  try {
    var loc = window.location;
    var isCallback = loc.pathname.startsWith('/auth/callback');
    var hasHash = !!loc.hash;
    var isRoot = loc.pathname === '/';
    var alreadyHashPath = loc.pathname.startsWith('/#');
    var isGanhavel = loc.pathname.startsWith('/ganhavel/');

    // NEVER rewrite ganhavel URLs - let them go to clean paths
    if (isGanhavel) {
      console.log('[REDIRECT-HASH] Skipping ganhavel URL:', loc.href);
      return;
    }

    // Only rewrite to /#/... when it's NOT the OAuth callback and NOT ganhavel
    if (!isCallback && !hasHash && !isRoot && !alreadyHashPath) {
      var path = loc.pathname + loc.search + loc.hash;
      var newUrl = loc.origin + '/#' + path.replace(/^\//, '');
      console.log('[REDIRECT-HASH] Converting to hash:', loc.href, '->', newUrl);
      loc.replace(newUrl);
    }
  } catch (_) { /* diagnostics only */ }
})();

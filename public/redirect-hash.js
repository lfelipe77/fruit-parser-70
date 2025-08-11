(function(){
  try {
    var loc = window.location;
    var hasHash = !!loc.hash;
    var isRoot = loc.pathname === '/';
    var alreadyHashPath = loc.pathname.startsWith('/#');
    if (!hasHash && !isRoot && !alreadyHashPath) {
      var path = loc.pathname + loc.search + loc.hash;
      var newUrl = loc.origin + '/#' + path.replace(/^\//, '');
      loc.replace(newUrl);
    }
  } catch (_) {
    // no-op: diagnostics only
  }
})();

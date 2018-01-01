const routes = [];
$(document).on('ready', () => {
  const { pathname } = location;
  for (const route of routes) {
    if (route.pathisRe ? pathname.match(route.path) : route.path === pathname) {
      route.enter.call(null, pathname);
      route.current = true;
    } else if (route.current) {
      route.current = false;
      route.exit.call(null, pathname);
    }
  }
});

$(window).on('beforeunload', () => {
  const route = routes.find(route => route.current) || { exit: () => {} };
  route.current = false;
  route.exit.call(null);
});

export function route(path, enter, exit = () => {}) {
  if (!path || !enter) {
    throw new Error('Expecting at least two arguments to utils.route(), got: ' + JSON.stringify(arguments));
  }
  routes.push({
    path,
    pathisRe: path instanceof RegExp,
    enter,
    exit,
    current: false
  });
}

export function onLoad(cb) {
  $(document).on('ready', cb);
}
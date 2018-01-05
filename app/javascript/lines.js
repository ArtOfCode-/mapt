// TODO scale route points as user zooms
// TODO stop direction

const { markerPath, onLoad } = require('./util');
import createDebug from 'debug';

const debug = createDebug('mapt:lines');

const initLineMap = (id, container, routingPoints, stops) => {
  const centerRoutingPoint = routingPoints[Math.floor(routingPoints.length / 2)];
  let center;

  if (centerRoutingPoint) {
    center = { lat: parseFloat(centerRoutingPoint.lat), lng: parseFloat(centerRoutingPoint.long) };
  }
  else {
    center = { lat: 0.0, lng: 0.0 };
  }

  const map = new google.maps.Map(container, {
    zoom: 12,
    center
  });

  const stopMarkers = [];
  const markerIcon = markerPath('danger');
  stops.forEach((stop) => {
    let marker = new google.maps.Marker({
      position: { lat: parseFloat(stop.lat), lng: parseFloat(stop.long) },
      map: map,
      icon: markerIcon
    });
    stopMarkers.push(marker);
  });

  const routePath = routingPoints.map((x) => { return { lat: parseFloat(x.lat), lng: parseFloat(x.long) }; });
  const route = new google.maps.Polyline({
    path: routePath,
    geodesic: true,
    strokeColor: '#AA0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  route.setMap(map);

  const routePoints = [];
  routingPoints.forEach((x) => {
    const point = new google.maps.Circle({
      center: { lat: parseFloat(x.lat), lng: parseFloat(x.long) },
      radius: 20,
      map: map,
      fillColor: '#AA0000',
      fillOpacity: 1.0,
      strokeColor: '#AA0000',
      strokeWeight: 2,
      strokeOpacity: 1.0
    });
    routePoints.push(point);
  });

  return { map, stopMarkers, routePoints, routePath, route };
};

const getLineData = (id) => {
  return mapt.linesData[id] || mapt.linesData[parseInt(id, 10)];
};

const initLinesIndexMaps = () => {
  $('.line-panel').each((i, el) => {
    const id = $(el).data('id');
    const container = $(el).find('.line-condensed-map');
    const { stops, routing_points: routingPoints } = getLineData(id);

    initLineMap(id, container[0], routingPoints, stops);
  });
};

const initLineShowMap = () => {
  const $container = $('.line-full-map');
  const id = $container.data('id');
  const { stops, routing_points: routingPoints } = getLineData(id);

  initLineMap(id, $container[0], routingPoints, stops);
};

const initRouteEditMap = () => {
  const $container = $('.line-full-map');
  const id = $container.data('id');
  const { stops, routing_points: routingPoints } = getLineData(id);

  let { map, stopMarkers, routePoints, route } = initLineMap(id, $container[0], routingPoints, stops);

  const deleteStop = (ev) => {
    if ($container.data('mode') !== 'stops') {
      return;
    }

    const position = { lat: ev.latLng.lat().toFixed(12), long: ev.latLng.lng().toFixed(12) };
    $.ajax({
      type: 'DELETE',
      url: '/stops/location',
      data: position
    })
    .done(() => {
      const marker = stopMarkers.filter((x) => x.getPosition().equals(ev.latLng))[0];
      marker.setMap(null);
    })
    .fail((xhr) => {
      debug('Stop deletion failed: ', position, xhr);
    });
  };

  stopMarkers.forEach((x) => {
    x.addListener('click', deleteStop);
  });

  const deletePoint = (ev) => {
    if ($container.data('mode') !== 'route') {
      return;
    }

    const point = routePoints.filter((x) => x.getBounds().contains(ev.latLng))[0];
    const position = { lat: point.getCenter().lat().toFixed(12), long: point.getCenter().lng().toFixed(12) };
    $.ajax({
      type: 'DELETE',
      url: '/points/location',
      data: position
    })
    .done(() => {
      route.getPath().forEach((x, i) => {
        if (x.equals(point.getCenter())) {
          route.getPath().removeAt(i);
        }
      });
      point.setMap(null);
    })
    .fail((xhr) => {
      debug('Point deletion failed: ', position, xhr);
    });
  };

  routePoints.forEach((x) => {
    x.addListener('click', deletePoint);
  });

  map.addListener('click', (ev) => {
    if ($container.data('mode') === 'stops') {
      const data = {
        stop: {
          lat: ev.latLng.lat(),
          long: ev.latLng.lng(),
          name: prompt('Stop name:'),
          line_id: parseInt(id, 10)
        }
      };
      $.ajax({
        type: 'POST',
        url: '/stops/new',
        data
      })
      .done(() => {
        const marker = new google.maps.Marker({
          map,
          icon: markerPath('danger'),
          position: ev.latLng
        });
        stopMarkers.push(marker);
        marker.addListener('click', deleteStop);
      })
      .fail((xhr) => {
        debug('Stop creation failed:', data, xhr);
      });
    }
    else if ($container.data('mode') === 'route') {
      const data = {
        routing_point: {
          lat: ev.latLng.lat(),
          long: ev.latLng.lng(),
          line_id: parseInt(id, 10)
        }
      };
      $.ajax({
        type: 'POST',
        url: '/points/new',
        data
      })
      .done(() => {
        const point = new google.maps.Circle({
          center: ev.latLng,
          radius: 20,
          map: map,
          fillColor: '#AA0000',
          fillOpacity: 1.0,
          strokeColor: '#AA0000',
          strokeWeight: 2,
          strokeOpacity: 1.0
        });
        routePoints.push(point);
        route.getPath().push(ev.latLng);
      })
      .fail((xhr) => {
        debug('Point creation failed:', data, xhr);
      });
    }
  });
};

Object.globalAssign('mapt', { initLinesIndexMaps, initLineShowMap, initRouteEditMap });

onLoad(() => {
  const $map = $('.line-full-map');

  $('.edit-line-toggle').on('click', (ev) => {
    ev.preventDefault();

    const $target = $(ev.target);
    $target.toggleClass('active');
    if ($target.hasClass('active')) {
      $('.edit-line-toggle').not(ev.target).removeClass('active');
      $map.data('mode', $target.data('mode'));
    }
    else {
      $map.data('mode', null);
    }
    $('body').click();
  });
});

const { markerPath, onLoad } = require('./util');
import createDebug from 'debug';

const debug = createDebug('mapt:lines');

const pointRadius = (map) => {
  const bounds = map.getBounds();
  const pixHeight = 550;
  const latHeight = Math.abs(bounds.getNorthEast().lat() - bounds.getSouthWest().lat());
  const heightMeters = latHeight * 111111;
  const perPix = heightMeters / pixHeight;

  return 10 * perPix;
};

const findMinMax = (arr, fProp) => {
  let min = arr[0], max = arr[0];
  let minVal = fProp(min), maxVal = fProp(max);

  for (let i = 1; i < arr.length; i++) {
    let v = fProp(arr[i]);
    min = (v < minVal) ? arr[i] : min;
    max = (v > maxVal) ? arr[i] : max;
  }

  return [min, max];
};

const initLineMap = (id, container, routingPoints, stops, includePoints) => {
  return new Promise((resolve, reject) => {
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
    map.setClickableIcons(false);

    if (routingPoints.length > 0) {
      const latMinMax = findMinMax(routingPoints, (x) => parseFloat(x.lat));
      const longMinMax = findMinMax(routingPoints, (x) => parseFloat(x.long));
      const bounds = { north: parseFloat(latMinMax[1].lat), south: parseFloat(latMinMax[0].lat),
                       east: parseFloat(longMinMax[1].long), west: parseFloat(longMinMax[0].long) };
      map.fitBounds(bounds);
    }

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

    google.maps.event.addListenerOnce(map, 'idle', () => {
      const routePoints = [];
      if (includePoints) {
        routingPoints.forEach((x) => {
          const point = new google.maps.Circle({
            center: {lat: parseFloat(x.lat), lng: parseFloat(x.long)},
            radius: pointRadius(map),
            map: map,
            fillColor: '#AA0000',
            fillOpacity: 1.0,
            strokeColor: '#AA0000',
            strokeWeight: 2,
            strokeOpacity: 1.0
          });
          routePoints.push(point);
        });
      }

      resolve({ map, stopMarkers, routePoints, routePath, route });
    });
  });
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

  initLineMap(id, $container[0], routingPoints, stops, true).then((data) => {
    let { map, stopMarkers, routePoints, route } = data;

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
        const path = route.getPath();
        for (let i = 0; i < path.length; i++) {
          let x = path.getAt(i);
          if (x.equals(point.getCenter())) {
            route.getPath().removeAt(i);
            break;
          }
        }
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
        const $direction = $('#stop_direction');
        const $formGroup = $direction.parents('.form-group');
        const direction = $direction.val();
        if (!direction) {
          $formGroup.addClass('has-error');
          $formGroup.find('.help-block').show();
          return;
        }
        else {
          $formGroup.removeClass('has-error');
          $formGroup.find('.help-block').hide();
        }

        const data = {
          stop: {
            lat: ev.latLng.lat(),
            long: ev.latLng.lng(),
            name: prompt('Stop name:'),
            line_id: parseInt(id, 10),
            direction
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
            radius: pointRadius(map),
            map: map,
            fillColor: '#AA0000',
            fillOpacity: 1.0,
            strokeColor: '#AA0000',
            strokeWeight: 2,
            strokeOpacity: 1.0
          });
          routePoints.push(point);
          route.getPath().push(ev.latLng);
          point.addListener('click', deletePoint);
        })
        .fail((xhr) => {
          debug('Point creation failed:', data, xhr);
        });
      }
    });

    map.addListener('zoom_changed', () => {
      routePoints.forEach((x) => x.setRadius(pointRadius(map)));
    });
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

  $(document).on('ajax:success', '.move-stop', (ev, data) => {
    const $target = $(ev.target);
    if (data.position === 0) {
      $target.parents('tbody').prepend($target.parents('tr').remove());
    }
    else {
      const $trs = $target.parents('tbody').children('tr');
      const shift = (data.position - $trs.length) + 1;
      const insertAfterIdx = data.position - shift;
      $trs.eq(insertAfterIdx).after($target.parents('tr').remove());
    }
  });

  $('.delete-connection').on('ajax:success', (ev) => {
    $(ev.target).parents('tr').fadeOut(200, function () {
      $(this).remove();
    });
  });

  $('.toggle-change').on('ajax:success', (ev) => {
    const $target = $(ev.target);
    $target.toggleClass('text-danger').toggleClass('text-success');
    $target.children('i').toggleClass('fa-times').toggleClass('fa-check');
  });
});

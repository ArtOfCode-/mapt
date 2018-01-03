import createDebug from 'debug';
const { onLoad } = require('./util');
import icons from './fa-icons';
const debug = createDebug('mapt:modes');

onLoad(() => {
  const setModeIcon = (el) => {
    let $selector = $('#mode-icon-selector');
    let validIcon = icons.indexOf(`fa-${$(el).val()}`) > -1;
    if (validIcon) {
      $selector.attr('class', '').addClass(`fa fa-${$(el).val()}`);
    }
  };

  const iconInput = $('#mode-icon-input');
  setModeIcon(iconInput);
  iconInput.on('keyup', (ev) => setModeIcon(ev.target));

  $('.mode-delete').on('ajax:success', (ev) => {
    $(ev.target).parents('.col-md-4').fadeOut(200, function () {
      $(this).remove();
    });
  });
});

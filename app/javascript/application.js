const { onLoad } = require('./util');

onLoad(() => {
  $('.select2').select2({
    theme: 'bootstrap',
    allowClear: true
  });
});

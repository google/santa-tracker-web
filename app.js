(function() {

var DEFAULT_ROUTE = 'workshop';

var template = document.querySelector('#t');

template.addEventListener('template-bound', function(e) {
  t.route = t.route || DEFAULT_ROUTE;
});

})();

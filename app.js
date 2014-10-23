(function() {

var DEFAULT_ROUTE = 'workshop';

var template = document.querySelector('#t');

template.addEventListener('template-bound', function(e) {
  template.route = template.route || DEFAULT_ROUTE;
});

})();

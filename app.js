(function() {

var DEFAULT_ROUTE = 'village';

var t = document.querySelector('#t');

t.addEventListener('template-bound', function(e) {
  t.route = t.route || DEFAULT_ROUTE;
});

})();

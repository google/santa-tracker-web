(function() {

var DEFAULT_ROUTE = 'village';

var template = document.querySelector('#t');

template.addEventListener('template-bound', function(e) {
  template.route = template.route || DEFAULT_ROUTE;
});

// TODO(ericbidelman): temp stub.
window.santatracker = {
  analytics: {
    trackGameStart: function(){},
    trackGameQuit: function(){}
  }
};

Klang = {
  triggerEvent: function(){},
};

})();

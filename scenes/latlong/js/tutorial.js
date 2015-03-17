goog.provide('app.Tutorial');



app.Tutorial = function(elem) {
  this.tutorial = elem.find('.Tutorial');
};


app.Tutorial.prototype.start = function() {
  var self = this;
  $(window).on('mousedown.latlong touchstart.latlong', function() {
    self.tutorial.hide();
    self.shown = true;
  });

  setTimeout(function() {
    if (!self.shown) {
      self.tutorial.show();
    }
  }, 3000);

  $(document).on('mousedown.latlong touchstart.latlong', '.Present:not(:has(.Elf))', function(e) {
    self.tutorial.show();
    e.stopPropagation();
  });
};

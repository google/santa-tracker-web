function devloader(moduleId) {
  $('#module-' + moduleId).load('template.html');

  window.santatracker = {
    muteState: { addListener: function() {}, isMuted: function() {} },
    getStaticDir: function() {
      return '/apps/' + moduleId + '/';
    },
    analytics: { trackGameStart: function() {} },
    onModuleLoad: function(name, createModule) {
      Klang.init('http://klangfiles.s3.amazonaws.com/uploads/projects/9b8619251a19057cff70779273e95aa6/config.json?_=' + new Date().getTime(), function() {
        var module = createModule();
        var count = 0;
        module.onPreload({
          addKlang: function(eventName) {
            Klang.triggerEvent(eventName);
          },
          create: function() {
            count++;
            return {
              notify: function() {},
              resolve: function() {
                count--;
                if (count === 0) {
                  module.onShow($('#module-' + moduleId)[0]);
                }
              }
            }
          }
        });
      });
    }
  };
}

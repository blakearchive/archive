'use strict';

angular.module('markdown', [])
  .provider('markdown', [function () {
    var opts = {};
    return {
      config: function (newOpts) {
        opts = newOpts;
      },
      $get: function () {
        var constructor = window.markdownit || markdownit;
        if (angular.isFunction(constructor)) {
          return new constructor
        }
        console.log('markdownit not found')
      }
    }
  }])
  .filter('markdown', ['markdown', function (markdown) {
    return function (text) {
      if (typeof text == 'string') {
        return markdown.render(text || '');
      } else {
        return text;
      }
    };
  }]);
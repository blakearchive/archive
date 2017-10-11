'use strict';

/* services.js */

// don't forget to declare this service module as a dependency in your main app constructor!
angular.module('blake').factory('alertService', function($rootScope) {
    var alertService = {};

    // create an array of alerts available globally
    $rootScope.alerts = [];

    alertService.add = function(type, msg) {
      $rootScope.alerts.push({'type': type, 'msg': msg});
      window.setTimeout(function() {
          var index = $rootScope.alerts.indexOf(alert);
          if (index > -1) {
              $rootScope.alerts.splice(index, 1);
              $rootScope.$apply(); // refresh GUI
          }
      }, 2500);
    };

    alertService.closeAlert = function(index) {
      $rootScope.alerts.splice(index, 1);
    };

    return alertService;
  });

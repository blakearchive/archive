angular.module('blake')
.factory('alertFactory',['$rootScope',
    function($rootScope) {
    var alertService = {};
    $rootScope.alerts = [];

    // will automatidally close
    // types are success, warning, info, danger
    alertService.add = function(type, msg, delay) {
        var alert = {'type': type, 'msg': msg};
        $rootScope.alerts.push(alert);
        if (!delay ) {
            delay = 3200; // default delay is 2500ms
        }
        window.setTimeout(function() {
            var index = $rootScope.alerts.indexOf(alert);
            if (index > -1) {
                $rootScope.alerts.splice(index, 1);
                $rootScope.$apply(); // refresh GUI
            }
        }, delay);
    }

    return alertService;
}])

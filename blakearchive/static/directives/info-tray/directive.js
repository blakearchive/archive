angular.module('blake').directive("infoTray", function() {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/blake/static/directives/info-tray/template.html',
        controller: 'infoTrayController'
    };
});

angular.module('blake').controller('infoTrayController', ['$scope', function($scope) {
}]);
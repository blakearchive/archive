angular.module('blake').directive("viewSubMenu", function() {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/blake/static/directives/view-sub-menu/template.html',
        controller: 'viewSubMenuController'
    };
});

angular.module('blake').controller('viewSubMenuController', ['$scope', function($scope) {
}]);
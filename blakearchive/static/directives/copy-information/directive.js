/**
 * Created by nathan on 2/13/15.
 */

angular.module('blake').directive("copyInformation", function () {
    return {
        restrict: 'E',
        templateUrl: "/blake/static/directives/copy-information/template.html",
        controller: "CopyInformationController"
    }
});

angular.module('blake').controller("CopyInformationController",['$scope', 'BlakeDataService', function ($scope, BlakeDataService) {

    $scope.copy = BlakeDataService.getSelectedCopy();

    $scope.$on("copySelectionChange", function () {
        $scope.copy = BlakeDataService.getSelectedCopy();
    });

    $scope.getOriginationRole = function (role) {
        if (role) {
            if (role.join) {
                var roleText = [];
                role.forEach(function (role) {
                    roleText.push(role['#text']);
                });
                return roleText.join(' ');
            } else {
                return role['#text'];
            }
        }
    }
}]);
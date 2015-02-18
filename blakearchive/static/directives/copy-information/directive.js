/**
 * Created by nathan on 2/13/15.
 */

angular.module('blake').directive("copyInformation", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/copy-information/template.html",
        controller: "CopyInformationController"
    }
});

angular.module('blake').controller("CopyInformationController", function ($scope, BlakeDataService) {
    $scope.$watch(BlakeDataService.getSelectedCopy, function (copy) {
        $scope.copy = copy;
    });

    $scope.getOriginationRole = function (role) {
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
});
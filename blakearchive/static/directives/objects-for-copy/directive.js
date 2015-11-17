/**
 * Created by nathan on 2/3/15.
 */

angular.module('blake').directive("objectsForCopy", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/objects-for-copy/template.html",
        controller: "ObjectsForCopyController"
    }
});

/*
Appears to be unnecessary, but I'll leave it here until Nathan takes a look. Viewer certainly loads faster without it.

angular.module('blake').controller("ObjectsForCopyController", ['$scope', 'BlakeDataService', function ($scope, BlakeDataService) {
    $scope.$watch(BlakeDataService.getSelectedCopy, function (copy) {
        if (copy) {
            $scope.copy = copy;
            BlakeDataService.getObjectsForCopy(copy.bad_id).then(function (data) {
                $scope.objects = data;
            })
        }
    });
}]);*/

angular.module('blake').controller("ObjectsForCopyController", ['$scope', function ($scope) {
}]);
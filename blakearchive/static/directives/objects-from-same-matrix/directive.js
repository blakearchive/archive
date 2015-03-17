/**
 * Created by nathan on 2/3/15.
 */

angular.module('blake').directive("objectsFromSameMatrix", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/objects-from-same-matrix/template.html",
        controller: "ObjectsFromSameMatrixController"
    }
});

angular.module('blake').controller("ObjectsFromSameMatrixController", function ($scope, BlakeDataService) {
     $scope.$watch(BlakeDataService.getSelectedCopy, function (copy) {
         if (copy) {
             $scope.copy = copy;
             BlakeDataService.getObjectsFromSameMatrix(copy.bad_id).then(function (data) {
                 $scope.objects = data;
             });
         }
     });
});
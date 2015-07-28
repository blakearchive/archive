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

angular.module('blake').controller("ObjectsFromSameMatrixController", ['$scope', 'BlakeDataService', function ($scope, BlakeDataService) {
    $scope.BlakeDataService = BlakeDataService;
    $scope.$on("objectSelectionChange", function () {
        var obj = BlakeDataService.getSelectedObject();
        if (obj) {
            $scope.item = obj;
            BlakeDataService.getObjectsFromSameMatrix(obj.object_id).then(function (data) {
                $scope.objects = data;
            });
        }
    });

    $scope.selectAll = function () {
        for (var i = $scope.objects.length; i--;) {
            BlakeDataService.addComparisonObject($scope.objects[i]);
        }
    }
}]);
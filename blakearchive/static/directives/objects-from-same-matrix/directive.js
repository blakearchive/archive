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

    // Add/remove all objects for comparison
    $scope.compareText = "Select All Objects";
    $scope.selectedAll = false;
    BlakeDataService.clearComparisonObjects();

    $scope.selectAll = function () {
        var obj_size = $scope.objects.length;
        BlakeDataService.clearComparisonObjects(); // Clear out old comparisons

        if(!$scope.selectedAll) {
            $scope.compareText = "Clear All Objects";
            $scope.selectedAll = true;

            // Add main viewer img
            BlakeDataService.addComparisonObject($scope.item);

            // Add imgs to compare main viewer img too.
            for (var i = obj_size; i--;) {
                $scope.objects[i].Selected = true;
                BlakeDataService.addComparisonObject($scope.objects[i]);
            }
        } else {
            $scope.compareText = "Select All Objects";
            $scope.selectedAll = false;

            for (var j = obj_size; j--;) {
                $scope.objects[j].Selected = false;
            }

            BlakeDataService.clearComparisonObjects();
        }
    };

    // Add/remove single object for comparison
    $scope.selectOne = function(obj) {
        if(!obj.Selected) {
            obj.Selected = false;
            BlakeDataService.removeComparisonObject(obj);
        } else {
            obj.Selected = true;
            BlakeDataService.addComparisonObject(obj);
        }

        // Add main viewer img
        if(BlakeDataService.getComparisonObjects) {
            BlakeDataService.addComparisonObject($scope.item);
        }
    };
}]);
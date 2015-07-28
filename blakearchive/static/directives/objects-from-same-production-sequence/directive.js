/**
 * Created by nathan on 2/3/15.
 */

angular.module('blake').directive("objectsFromSameProductionSequence", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/objects-from-same-production-sequence/template.html",
        controller: "ObjectsFromSameProductionSequenceController"
    }
});

angular.module('blake').controller("ObjectsFromSameProductionSequenceController", ['$scope', 'BlakeDataService', function ($scope, BlakeDataService) {
    $scope.BlakeDataService = BlakeDataService;
    $scope.$on("objectSelectionChange", function () {
        var obj = BlakeDataService.getSelectedObject();
        if (obj) {
            $scope.item = obj;
            BlakeDataService.getObjectsFromSameProductionSequence(obj.object_id).then(function (data) {
                $scope.objects = data;
            });
        }
    });
}]);
/**
 * Created by nathan on 2/3/15.
 */

angular.module('blake').directive("objectsWithSameMotif", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/objects-with-same-motif/template.html",
        controller: "ObjectsWithSameMotifController"
    }
});

angular.module('blake').controller("ObjectsWithSameMotifController", ['$scope', 'BlakeDataService', function ($scope, BlakeDataService) {
    $scope.BlakeDataService = BlakeDataService;
    $scope.$on("objectSelectionChange", function () {
        var obj = BlakeDataService.getSelectedObject();
        if (obj) {
            $scope.item = obj;
            BlakeDataService.getObjectsWithSameMotif(obj.object_id).then(function (data) {
                $scope.objects = data;
            });
        }
    });
}]);
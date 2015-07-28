/**
 * Created by nathan on 2/3/15.
 */

angular.module('blake').directive("copiesForWork", function () {
    return {
        restrict: 'E',
        templateUrl: "/blake/static/directives/copies-for-work/template.html",
        controller: "CopiesForWorkController"
    }
});

angular.module('blake').controller("CopiesForWorkController", ['$scope', 'BlakeDataService', function ($scope, BlakeDataService) {
    $scope.$on("workSelectionChange", function () {
        $scope.work = BlakeDataService.getSelectedWork();
    });

    $scope.$on("workSelectionCopiesChange", function () {
        var data = BlakeDataService.getSelectedWorkCopies();
        data.sort(function (a, b) {
            return a.source.objdescid.compdate["@value"] - b.source.objdescid.compdate["@value"];
        });

        $scope.copies = data;
    });
}]);
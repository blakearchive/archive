/**
 * Created by nathan on 2/3/15.
 */

angular.module('blake').directive("copiesForWork", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/copies-for-work/template.html",
        controller: "CopiesForWorkController"
    }
});

angular.module('blake').controller("CopiesForWorkController", function ($scope, BlakeDataService) {
    $scope.$watch(BlakeDataService.getSelectedCopy, function (copy) {
        if (copy) {
            $scope.copy = copy;
            BlakeDataService.getCopiesForWork(copy.bad_id).then(function (data) {
                data.sort(function (a, b) {
                    return a.source.comp_date["@value"] - b.source.comp_date["@value"];
                });

                $scope.objects = data;
            });
        }
    });
});
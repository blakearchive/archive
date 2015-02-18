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
    BlakeDataService.getCopiesForWork().then(function(data) {
        $scope.objects = data;
    })
});
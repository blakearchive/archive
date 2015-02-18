/**
 * Created by nathan on 2/3/15.
 */

angular.module('blake').directive("copiesForWork", function () {
    scope.$watch('copies', function (data) {
        if (!data) { return; }

        data.sort(function(a, b) { return a.source.comp_date["@value"] - b.source.comp_date["@value"]; });

        var copies = [];
        data.forEach(function(d) {
            copies.push(d);
        });

        scope.copies = copies;
    });

    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/copies-for-work/template.html",
        controller: "CopiesForWorkController"
    }
});

angular.module('blake').controller("CopiesForWorkController", function ($scope, BlakeDataService) {
    BlakeDataService.getCopiesForWork().then(function(data) {
        $scope.copies = data;
    })
});
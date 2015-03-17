/**
 * Created by nathan on 2/3/15.
 */

angular.module('blake').directive("objectsFromSameSequence", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/objects-from-same-production-sequence/template.html",
        controller: "ObjectsFromSameSequenceController"
    }
});

angular.module('blake').controller("ObjectsFromSameSequenceController", function ($scope, BlakeDataService) {
    BlakeDataService.getObjectsFromSameProductionSequence().then(function(data) {
        $scope.objects = data;
    })
});
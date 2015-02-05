/**
 * Created by nathan on 2/3/15.
 */

angular.module('blake').directive("objectsInCopy", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/objects-in-copy/template.html",
        controller: "ObjectsInCopyController"
    }
});

angular.module('blake').controller("ObjectsInCopyController", function ($scope, MockBlakeDataService) {
    MockBlakeDataService.getObjectsForCopy().then(function(data) {
        $scope.objects = data;
    })
});
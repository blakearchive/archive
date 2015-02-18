/**
 * Created by nathan on 2/3/15.
 */

angular.module('blake').directive("objectsForCopy", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/objects-for-copy/template.html",
        controller: "ObjectsForCopyController"
    }
});

angular.module('blake').controller("ObjectsForCopyController", function ($scope, MockBlakeDataService) {
    MockBlakeDataService.getObjectsForCopy().then(function(data) {
        $scope.objects = data;
    })
});
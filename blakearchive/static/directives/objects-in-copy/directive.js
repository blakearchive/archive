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

angular.module('blake').controller("ObjectsInCopyController", function ($scope, webtest) {
    webtest.fetch().then(function(data) {
        $scope.objects = data;
    })
});

angular.module('blake').factory('webtest', function($q, $timeout, $http) {
    var Webtest = {
        fetch: function(callback) {

            var deferred = $q.defer();

            $timeout(function() {
                $http.get('/blake/static/json/objects.json').success(function(data) {
                    deferred.resolve(data);
                });
            }, 30);

            return deferred.promise;
        }
    };

    return Webtest;
});
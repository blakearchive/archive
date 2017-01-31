angular.module("blake").controller('TwitterShareController', function($scope,$rootScope,$location){
    $scope.myLocation = $location.path;
});

angular.module("blake").directive('twitterShare', function(){
    return {
        restrict: 'A',
        controller: "TwitterShareController",
    }
});
angular.module("blake").controller("BlakeMenuController", function($scope,$rootScope){
    $scope.worksNavState = $rootScope.worksNavState;
});

angular.module("blake").directive('blakeMenu', function(){
    return {
        restrict: 'A',
        controller: "BlakeMenuController",
    }
});
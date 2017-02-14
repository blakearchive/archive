angular.module("blake").directive('parallax', function ($window) {
    return function (scope, element, attr) {
        angular.element($window).bind("scroll", function () {
            scope.$broadcast('scroll::scroll', {'offset': this.pageYOffset});
        });
    };
});
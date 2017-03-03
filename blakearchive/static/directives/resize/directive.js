angular.module("blake").directive('resize', function ($rootScope, $window, $timeout, WindowSize) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return {
                'h': w.innerHeight(),
                'w': w.innerWidth()
            };
        };

        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            $timeout.cancel(scope.resizing);

            // Add a timeout to not call the resizing function every pixel
            scope.resizing = $timeout(function () {
                WindowSize.height = newValue.h;
                WindowSize.width = newValue.w;
                $rootScope.$broadcast('resize::resize', {height: WindowSize.height, width: WindowSize.width});
            }, 300);


        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }

});
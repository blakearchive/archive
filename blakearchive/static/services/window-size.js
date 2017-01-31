// TODO: resize directive should not need to broadcast if the factory is properly formatted
angular.module("blake").factory('WindowSize', function ($window) {
    var windowSize = {},
        w = angular.element($window)[0];

    windowSize.height = w.innerHeight;
    windowSize.width = w.innerWidth;

    return windowSize;
});
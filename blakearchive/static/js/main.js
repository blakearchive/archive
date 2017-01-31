directoryPrefix = '';

angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q',
        function ($scope, $timeout, $transition, $q) {
        }]).directive('carousel', [function () {
    return {}
}]);


angular.module('blake', ['ngRoute', 'ngSanitize', 'ui-rangeSlider', 'ui.bootstrap', 'ng-sortable', 'FBAngular', 'ngAnimate', 'ngStorage','ngCookies','ngTouch','markdown','angular-loading-bar'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when(directoryPrefix + '/', {
            templateUrl: directoryPrefix + '/static/controllers/home/home.html',
            controller: "HomeController",
            controllerAs: 'home'
        });
        $routeProvider.when(directoryPrefix + '/staticpage/:initialPage', {
            templateUrl: directoryPrefix + '/static/controllers/staticpage/staticpage.html',
            controller: "StaticpageController",
            controllerAs: 'staticpage',
            reloadOnSearch: false
        });
        $routeProvider.when(directoryPrefix + '/object/:descId', {
            templateUrl: directoryPrefix + '/static/html/object.html',
            controller: "ObjectController"
        });
        $routeProvider.when(directoryPrefix + '/copy/:copyId', {
            templateUrl: directoryPrefix + '/static/controllers/copy/copy.html',
            controller: "CopyController",
            controllerAs: 'copyCtrl',
            reloadOnSearch: false
        });
        $routeProvider.when(directoryPrefix + '/exhibit/:copyId', {
            templateUrl: directoryPrefix + '/static/controllers/exhibit/exhibit.html',
            controller: "ExhibitController",
            controllerAs: 'exhibitCtrl',
            reloadOnSearch: false
        });
        $routeProvider.when(directoryPrefix + '/new-window/:what/:copyId', {
            templateUrl: directoryPrefix + '/static/controllers/showme/showme.html',
            controller: "ShowMeController",
            controllerAs: 'showme',
            reloadOnSearch: false
        });
        $routeProvider.when(directoryPrefix + '/work/:workId', {
            templateUrl: directoryPrefix + '/static/controllers/work/work.html',
            controller: "WorkController",
            controllerAs: 'workCtrl'
        });
        /*$routeProvider.when(directoryPrefix + '/compare/', {
         templateUrl: directoryPrefix + '/static/controllers/compare/compare.html',
         controller: "CompareController",
         controllerAs: 'compareCtrl'
         });*/
        $routeProvider.when(directoryPrefix + '/search/', {
            templateUrl: directoryPrefix + '/static/controllers/search/search.html',
            controller: "SearchController",
            controllerAs: 'searchCtrl'
        });

        $routeProvider.otherwise({redirectTo: directoryPrefix + '/'});
        $locationProvider.html5Mode(true);
    }])
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.parentSelector = '.loading-bar-container';
    }])

    .run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
        var original = $location.path;
        $location.path = function (path, reload) {
            if (reload === false) {
                var lastRoute = $route.current;
                var un = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    un();
                });
            }
            return original.apply($location, [path]);
        };
    }]);
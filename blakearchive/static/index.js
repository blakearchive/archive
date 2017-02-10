import 'script-loader!jquery';
import 'angular';
import 'angular-route';
import 'angular-sanitize';
import 'angular-animate';
import 'angular-loading-bar';
import 'angular-rangeslider';
import 'angular-cookies';
import 'angular-touch';
import './js/angular.ngStorage';
import './js/Sortable/Sortable.min';
import './js/Sortable/ng-sortable.min';
import './js/angular-ui-bootstrap/0.12.1/ui-bootstrap.min';
import './js/angular-fullscreen/angular-fullscreen.min';
import 'script-loader!./js/angular-markdown-it/markdown-it.min';
import './js/angular-markdown-it/angular-markdown-it';

let directoryPrefix = '';
let carousel = angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition']);

carousel.controller('CarouselController', function ($scope, $timeout, $transition, $q) {});
carousel.directive('carousel', function () { return {} });

let blake = angular.module('blake', ['ngRoute', 'ngSanitize', 'ui-rangeSlider', 'ui.bootstrap', 'ng-sortable', 'FBAngular', 'ngAnimate', 'ngStorage','ngCookies','ngTouch','markdown','angular-loading-bar'])

blake.value("directoryPrefix", directoryPrefix);

blake.config(function ($routeProvider, $locationProvider) {
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
    $routeProvider.when(directoryPrefix + '/search/', {
        templateUrl: directoryPrefix + '/static/controllers/search/search.html',
        controller: "SearchController",
        controllerAs: 'search'
    });

    $routeProvider.otherwise({redirectTo: directoryPrefix + '/'});
    $locationProvider.html5Mode(true);
});

blake.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '.loading-bar-container';
});

blake.run(function ($route, $rootScope, $location) {
    let original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            let lastRoute = $route.current;
            let un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
});

function requireAll(r) { r.keys().forEach(r); }

requireAll(require.context('./services/', true, /\.js$/));
requireAll(require.context('./controllers/', true, /\.js$/));
requireAll(require.context('./directives/', true, /\.js$/));
requireAll(require.context('./filters/', true, /\.js$/));
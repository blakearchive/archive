var app = angular.module('blake', ['ngRoute']);


app.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: '/static/html/home.html',
        controller: "HomeController"
    });
    $routeProvider.when('/work/:workId', {
        templateUrl: '/static/html/work.html',
        controller: "WorkController"
    });
    $routeProvider.when('/object/:objectId', {
        templateUrl: '/static/html/object.html',
        controller: "ObjectController"
    });
    $routeProvider.when('/compare/', {
        templateUrl: '/static/html/compare.html',
        controller: "CompareController"
    });
    $routeProvider.when('/search/', {
        templateUrl: '/static/html/search.html',
        controller: "SearchController"
    });

    $routeProvider.otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
});

/**
 * All data accessor functions should be placed here.
 */
app.service("blakeData", function ($http) {
    this.getWorks = function () {

    };

    this.getCopy = function () {

    };

    this.getObject = function () {

    };

    this.search = function () {

    };
});

app.controller("HomeController", function ($scope, blakeData) {

});

app.controller("WorkController", function ($scope, blakeData) {

});

app.controller("ObjectController", function ($scope, blakeData) {

});

app.controller("CompareController", function ($scope, blakeData) {

});

app.controller("SearchController", function ($scope, blakeData) {

});
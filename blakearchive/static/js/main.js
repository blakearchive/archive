var app = angular.module('blake', ['ngRoute']);

function createService(constructor) {
    return {
        create: function (config) {
            var i, result;
            if (config.length) {
                result = [];
                for (i = 0; i < config.length; i++) {
                    result.push(constructor(config))
                }
            } else {
                result = constructor(config);
            }
            return result;
        }
    };
}

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: '/static/html/home.html',
        controller: "HomeController"
    });
    $routeProvider.when('/object/:objectId', {
        templateUrl: '/static/html/object.html',
        controller: "ObjectController"
    });
    $routeProvider.when('/copy/:copyId', {
        templateUrl: '/static/html/copy.html',
        controller: "CopyController"
    });
    $routeProvider.when('/work/:workId', {
        templateUrl: '/static/html/work.html',
        controller: "WorkController"
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

app.factory("BlakeObject", function () {
    /**
     * Constructor takes a config object and creates a BlakeObject.
     *
     * @param config
     */
    var constructor = function (config) {
        return {id: config.id, document: config.document};
    };

    return createService(constructor);
});

app.factory("BlakeCopy", function (BlakeObject) {
    /**
     * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
     * BlakeObjects.
     *
     * @param config
     */
    var constructor = function (config) {
        var i, copy = {id: config.id, document: config.document, objects: []};
        for (i = 0; i < config.objects.length; i++) {
            copy.objects.push(BlakeObject.create(config.copies[i]))
        }
        return copy;
    };

    return createService(constructor);
});

app.factory("BlakeWork", function (BlakeCopy) {
    /**
     * Constructor takes a config object and creates a BlakeWork, with child objects transformed into the
     * BlakeCopies.
     *
     * @param config
     */
    var constructor = function (config) {
        var i, work = {id: config.id, document: config.document, copies: []};
        for (i = 0; i < config.copies.length; i++) {
            work.copies.push(BlakeCopy.create(config.copies[i]))
        }
        return work;
    };

    return createService(constructor);
});

app.factory("BlakeVirtualWorkGroup", function (BlakeWork) {
    /**
     * Constructor takes a config object and creates a BlakeVirtualWorkGroup, with child objects transformed
     * into the BlakeWorks.
     *
     * @param config
     */
    var constructor = function (config) {
        // TODO: double check if virtual work groups have a document
        var i, work = {id: config.id, document: config.document, works: []};
        for (i = 0; i < config.works.length; i++) {
            work.works.push(BlakeWork.create(config.copies[i]))
        }
        return work;
    };

    return createService(constructor);
});

app.factory("BlakeComparableGroup", function (BlakeObject) {
    /**
     * Constructor takes a config object and creates a BlakeComparableGroup, with child objects transformed
     * into the BlakeObjects.
     *
     * @param config
     */
    var constructor = function (config) {
        var i, comparableGroup = {id: config.id, objects: []};
        for (i = 0; i < config.objects.length; i++) {
            comparableGroup.objects.push(BlakeObject.create(config.objects[i]))
        }
        return comparableGroup;
    };

    return createService(constructor);
});

/**
 * All data accessor functions should be placed here.  This service should mirror the api of the back-end
 * BlakeDataService.
 */
app.factory("BlakeDataService", function ($http, $q, BlakeWork, BlakeCopy, BlakeObject, BlakeVirtualWorkGroup, BlakeComparableGroup) {
    var service = {
        query: function (config) {
            var url = '';
            return $q(function(resolve, reject) {
                $http.post(url, config).success(function (data) {
                    // TODO: Assuming here that the query function of the service on the server side will
                    // return only BlakeWorks.  If it returns complex data, this will need to be updated.
                    resolve(BlakeWork.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                });
            });
        },
        getObject: function (objectId) {
            var url = '/api/object/' + objectId;
            return $q(function(resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeObject.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        },
        getCopy: function (copyId) {
            var url = '/api/copy/' + copyId;
            return $q(function(resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeCopy.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        },
        getWork: function (workId) {
            var url = '/api/work/' + workId;
            return $q(function(resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeWork.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        },
        getVirtualWorkGroup: function (virtualWorkGroupId) {
            var url = '/api/virtual_work_group/' + virtualWorkGroupId;
            return $q(function(resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeVirtualWorkGroup.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        },
        getComparableGroup: function (comparableGroupId) {
            var url = '/api/comparable_group/' + comparableGroupId;
            return $q(function(resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeComparableGroup.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        }
    };

    return service;
});

app.controller("HomeController", function ($scope, BlakeDataService) {

});

app.controller("WorkController", function ($scope, BlakeDataService) {

});

app.controller("ObjectController", function ($scope, BlakeDataService) {

});

app.controller("CompareController", function ($scope, BlakeDataService) {

});

app.controller("SearchController", function ($scope, BlakeDataService) {

});
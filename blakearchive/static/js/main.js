angular.module('blake', ['ngRoute']).config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/blake/', {
        templateUrl: '/blake/static/html/home.html',
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
    $routeProvider.when('/blake/search/', {
        templateUrl: '/blake/static/html/search.html',
        controller: "SearchController"
    });

    $routeProvider.otherwise({redirectTo: '/blake/'});
    $locationProvider.html5Mode(true);
});

angular.module('blake').factory("GenericService", function () {
    return function (constructor) {
        return {
            create: function (config) {
                var i, result;
                if (config.length) {
                    result = [];
                    for (i = 0; i < config.length; i++) {
                        result.push(constructor(config[i]));
                    }
                } else {
                    result = constructor(config);
                }
                return result;
            }
        };
    }
});

angular.module('blake').factory("BlakeObject", function (GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeObject.
     *
     * @param config
     */
    var constructor = function (config) {
        var obj = angular.copy(config);
        obj.illustration_description = angular.fromJson(config.illustration_description);
        obj.characteristics = angular.fromJson(config.characteristics);
        obj.text = angular.fromJson(config.text);
        return obj;
    };

    return GenericService(constructor);
});

angular.module('blake').factory("BlakeCopy", function (BlakeObject, GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
     * BlakeObjects.
     *
     * @param config
     */
    var constructor = function (config) {
        var i, copy = {
            copy_id: config.copy_id,
            work_id: config.work_id,
            header: angular.fromJson(config.header),
            objects: []
        };
        if (config.objects) {
            for (i = 0; i < config.objects.length; i++) {
                copy.objects.push(BlakeObject.create(config.objects[i]));
            }
        }
        return copy;
    };

    return GenericService(constructor);
});

angular.module('blake').factory("BlakeWork", function (BlakeCopy, GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeWork, with child objects transformed into the
     * BlakeCopies.
     *
     * @param config
     */
    var constructor = function (config) {
        var i, work = {work_id: config.work_id, bad_id: config.bad_id, copies: []};
        if (config.copies) {
            for (i = 0; i < config.copies.length; i++) {
                work.copies.push(BlakeCopy.create(config.copies[i]));
            }
        }
        return work;
    };

    return GenericService(constructor);
});

angular.module('blake').factory("BlakeVirtualWorkGroup", function (BlakeWork, GenericService) {
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
            work.works.push(BlakeWork.create(config.works[i]));
        }
        return work;
    };

    return GenericService(constructor);
});

angular.module('blake').factory("BlakeComparableGroup", function (BlakeObject, GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeComparableGroup, with child objects transformed
     * into the BlakeObjects.
     *
     * @param config
     */
    var constructor = function (config) {
        var i, comparableGroup = {id: config.id, objects: []};
        for (i = 0; i < config.objects.length; i++) {
            comparableGroup.objects.push(BlakeObject.create(config.objects[i]));
        }
        return comparableGroup;
    };

    return GenericService(constructor);
});

/**
 * For the time being, all data accessor functions should be placed here.  This service should mirror the API
 * of the back-end BlakeDataService.
 */
angular.module('blake').factory("BlakeDataService", function ($http, $q, BlakeWork, BlakeCopy, BlakeObject, BlakeVirtualWorkGroup, BlakeComparableGroup) {
    return {
        query: function (config) {
            var url = '/blake/api/query';
            return $q(function(resolve, reject) {
                $http.post(url, config).success(function (data) {
                    resolve(data);
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
        getObjectsWithSameMotif: function (objectId) {

        },
        getObjectsFromSameMatrix: function (objectId) {

        },
        getObjectsFromSameProductionSequence: function (objectId) {

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
        getObjectsForCopy: function (copyId) {

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
        getWorks: function () {

        },
        getCopiesForWork: function (workId) {

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
});

angular.module('blake').controller("HomeController", function ($scope, BlakeDataService) {

});

angular.module('blake').controller("WorkController", function ($scope, BlakeDataService) {

});

angular.module('blake').controller("ObjectController", function ($scope, BlakeDataService) {

});

angular.module('blake').controller("CompareController", function ($scope, BlakeDataService) {

});

angular.module('blake').controller("SearchController", function ($scope, BlakeDataService) {
    $scope.search = function () {
        BlakeDataService.query($scope.searchConfig).then(function (results) {
            $scope.results = results;
        });

    };

    $scope.showWorks = true;
    $scope.showCopies = true;
    $scope.showObjects = true;
});

directoryPrefix = '/blake';

angular.module('blake', ['ngRoute']).config(function ($routeProvider, $locationProvider) {
    $routeProvider.when(directoryPrefix + '/', {
        templateUrl: directoryPrefix + '/static/html/home.html',
        controller: "HomeController"
    });
    $routeProvider.when(directoryPrefix + '/object/:objectId', {
        templateUrl: directoryPrefix + '/static/html/object.html',
        controller: "ObjectController"
    });
    $routeProvider.when(directoryPrefix + '/copy/:copyId', {
        templateUrl: directoryPrefix + '/static/html/copy.html',
        controller: "CopyController"
    });
    $routeProvider.when(directoryPrefix + '/work/:workId', {
        templateUrl: directoryPrefix + '/static/html/work.html',
        controller: "WorkController"
    });
    $routeProvider.when(directoryPrefix + '/compare/', {
        templateUrl: directoryPrefix + '/static/html/compare.html',
        controller: "CompareController"
    });
    $routeProvider.when(directoryPrefix + '/search/', {
        templateUrl: directoryPrefix + '/static/html/search.html',
        controller: "SearchController"
    });

    $routeProvider.otherwise({redirectTo: directoryPrefix + '/'});
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
            bad_id: config.bad_id,
            title: config.title,
            institution: config.institution,
            image: config.image,
            header: angular.fromJson(config.header),
            source: angular.fromJson(config.source)
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

        var i, work = angular.copy(config);
        if (config.copies) {
            for (i = 0; i < config.copies.length; i++) {
                work.copies.push(BlakeCopy.create(config.copies[i]));
            }
        }
        return work;
    };

    return GenericService(constructor);
});

angular.module('blake').factory("BlakeFeaturedWork", function (GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeFeaturedWork.
     *
     * @param config
     */
    var constructor = function (config) {
        return angular.copy(config);
    };

    return GenericService(constructor);
});

/**
 * For the time being, all data accessor functions should be placed here.  This service should mirror the API
 * of the back-end BlakeDataService.
 */
angular.module('blake').factory("BlakeDataService", function ($http, $q, $rootScope, BlakeWork, BlakeCopy, BlakeObject, BlakeFeaturedWork) {
    var selectedWork, selectedCopy, selectedObject, selectedWorkCopies, selectedCopyObjects, queryObjects,
        getObject, getObjectsWithSameMotif, getObjectsFromSameMatrix, getObjectsFromSameProductionSequence,
        getCopy, getObjectsForCopy, getWork, getWorks, getCopiesForWork, getFeaturedWorks, setSelectedWork,
        setSelectedCopy, setSelectedObject;

    queryObjects = function (config) {
        var url = directoryPrefix + '/api/query_objects';
        return $q(function(resolve, reject) {
            $http.post(url, config).success(function (data) {
                resolve(data);
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    getObject = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId;
        return $q(function(resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeObject.create(data));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getObjectsWithSameMotif = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId + '/objects_with_same_motif';
        return $q(function(resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeObject.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getObjectsFromSameMatrix = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId + '/objects_from_same_matrix';
        return $q(function(resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeObject.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getObjectsFromSameProductionSequence = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId + '/objects_from_same_production_sequence';
        return $q(function(resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeObject.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getCopy = function (copyId) {
        var url = directoryPrefix + '/api/copy/' + copyId;
        return $q(function(resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeCopy.create(data));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getObjectsForCopy = function (copyId) {
        var url = directoryPrefix + '/api/copy/' + copyId + '/objects';
        return $q(function(resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeObject.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getWork = function (workId) {
        var url = directoryPrefix + '/api/work/' + workId;
        return $q(function(resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeWork.create(data));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getWorks = function () {
        var url = directoryPrefix + '/api/work/';
        return $q(function(resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeWork.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getCopiesForWork = function (workId) {
        var url = directoryPrefix + '/api/work/' + workId + '/copies';
        return $q(function(resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeCopy.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getFeaturedWorks = function () {
        var url = directoryPrefix + '/api/featured_work/';
        return $q(function(resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeFeaturedWork.create(data.results));
            }).error(function (data, status) {
                reject(data, status)
            })
        });
    };

    setSelectedWork = function (workId) {
        return getWork(workId).then(function (work) {
            selectedWork = work;
            $rootScope.$broadcast("workSelectionChange", work);
            getCopiesForWork(workId).then(function (copies) {
                selectedWorkCopies = copies;
                $rootScope.$broadcast("workSelectionCopiesChange");
            })
        });
    };

    setSelectedCopy = function (copyId) {
        return getCopy(copyId).then(function (copy) {
            selectedCopy = copy;
            $rootScope.$broadcast("copySelectionChange", copy);
            getObjectsForCopy(copyId).then(function (objects) {
                selectedCopyObjects = objects;
                selectedObject = objects[0];
                $rootScope.$broadcast("copySelectionObjectsChange");
                $rootScope.$broadcast("objectSelectionChange");
            })
        })
    };

    setSelectedObject = function (objectId) {
        return getObject(objectId).then(function (obj) {
            selectedObject = obj;
            $rootScope.$broadcast("objectSelectionChange");
        })
    };

    return {
        queryObjects: queryObjects,
        getObject: getObject,
        getObjectsWithSameMotif: getObjectsWithSameMotif,
        getObjectsFromSameMatrix: getObjectsFromSameMatrix,
        getObjectsFromSameProductionSequence: getObjectsFromSameProductionSequence,
        getCopy: getCopy,
        getObjectsForCopy: getObjectsForCopy,
        getWork: getWork,
        getWorks: getWorks,
        getCopiesForWork: getCopiesForWork,
        getFeaturedWorks: getFeaturedWorks,
        setSelectedWork: setSelectedWork,
        setSelectedCopy: setSelectedCopy,
        setSelectedObject: setSelectedObject,
        getSelectedWork: function () {
            return selectedWork;
        },
        getSelectedCopy: function () {
            return selectedCopy;
        },
        getSelectedObject: function () {
            return selectedObject;
        },
        getSelectedWorkCopies: function () {
            return selectedWorkCopies;
        },
        getSelectedCopyObjects: function () {
            return selectedCopyObjects;
        }
    };
});

/**
 * This is a mock version of the BlakeDataService, which can be used for testing.
 */
angular.module('blake').factory("MockBlakeDataService", function ($http, $q, BlakeWork, BlakeCopy, BlakeObject, BlakeFeaturedWork) {
    var getObjects = function () {
        return $q(function(resolve, reject) {
            $http.get(directoryPrefix + '/static/json/objects.json').success(function(data) {
                resolve(BlakeObject.create(data));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getObject = function () {
        return $q(function(resolve, reject) {
            $http.get(directoryPrefix + '/static/json/objects.json').success(function(data) {
                resolve(BlakeObject.create(data[0]));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getCopies = function () {
        return $q(function(resolve, reject) {
            $http.get(directoryPrefix + '/static/json/copies.json').success(function(data) {
                resolve(BlakeCopy.create(data));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getCopy = function () {
        return $q(function(resolve, reject) {
            $http.get(directoryPrefix + '/static/json/copies.json').success(function(data) {
                resolve(BlakeCopy.create(data[0]));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getWorks = function () {
        return $q(function(resolve, reject) {
            $http.get(directoryPrefix + '/static/json/works.json').success(function(data) {
                resolve(BlakeWork.create(data));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getWork = function () {
        return $q(function(resolve, reject) {
            $http.get(directoryPrefix + '/static/json/works.json').success(function(data) {
                resolve(BlakeWork.create(data[0]));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getFeaturedWorks = function () {
        return $q(function(resolve, reject) {
            $http.get(directoryPrefix + '/static/json/featured_works.json').success(function(data) {
                resolve(BlakeFeaturedWork.create(data));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    return {
        query: function (config) {
            return getObjects();
        },
        getObject: function (objectId) {
            return getObject();
        },
        getObjectsWithSameMotif: function (objectId) {
            return getObjects();
        },
        getObjectsFromSameMatrix: function (objectId) {
            return getObjects();
        },
        getObjectsFromSameProductionSequence: function (objectId) {
            return getObjects();
        },
        getCopy: function (copyId) {
            return getCopy();
        },
        getObjectsForCopy: function (copyId) {
            return getObjects();
        },
        getWork: function (workId) {
            return getWork();
        },
        getWorks: function () {
            return getWorks();
        },
        getCopiesForWork: function (workId) {
            return getCopies();
        },
        getFeaturedWorks: function () {
            return getFeaturedWorks();
        }
    };
});

angular.module('blake').controller("HomeController", function ($scope, BlakeDataService) {
    BlakeDataService.getFeaturedWorks().then(function (results) {
        $scope.featured_works = results;
    });
});

angular.module('blake').controller("WorkController", function ($scope, BlakeDataService) {

});

angular.module('blake').controller("ObjectController", function ($scope, BlakeDataService) {

});

angular.module('blake').controller("CopyController", function ($scope, $routeParams, BlakeDataService) {
    BlakeDataService.setSelectedCopy($routeParams.copyId);
});

angular.module('blake').controller("SearchController", function ($scope, BlakeDataService) {
    $scope.search = function () {
        BlakeDataService.queryObjects($scope.searchConfig).then(function (results) {
            $scope.results = results;
        });
    };

    $scope.showWorks = true;
    $scope.showCopies = true;
    $scope.showObjects = true;
});

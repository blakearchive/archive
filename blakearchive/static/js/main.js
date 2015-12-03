directoryPrefix = '/blake';

angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q',
        function ($scope, $timeout, $transition, $q) {
        }]).directive('carousel', [function () {
        return {}
    }]);

angular.module('blake', ['ngRoute', 'ngSanitize', 'ui-rangeSlider', 'ui.bootstrap', 'ng-sortable', 'FBAngular']).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
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
    $routeProvider.when(directoryPrefix + '/copy/:copyId/:objectId', {
        templateUrl: directoryPrefix + '/static/html/copy.html',
        controller: "CopyController"
    });
    $routeProvider.when(directoryPrefix + '/work/:workId', {
        templateUrl: directoryPrefix + '/static/html/work.html',
        controller: "WorkController"
    });
    $routeProvider.when(directoryPrefix + '/compare/', {
        templateUrl: directoryPrefix + '/static/html/compare.html'
    });
    $routeProvider.when(directoryPrefix + '/search/', {
        templateUrl: directoryPrefix + '/static/html/search.html',
        controller: "SearchController"
    });

    $routeProvider.otherwise({redirectTo: directoryPrefix + '/'});
    $locationProvider.html5Mode(true);
}]);

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

angular.module('blake').factory("BlakeObject", ['GenericService', function (GenericService) {
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
}]);

angular.module('blake').factory("BlakeCopy", ['BlakeObject', 'GenericService', function (BlakeObject, GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
     * BlakeObjects.
     *
     * @param config
     */
    var constructor = function (config) {
        var i, copy = angular.copy(config);
        copy.header = angular.fromJson(config.header);
        copy.source = angular.fromJson(config.source);

        if (config.objects) {
            for (i = 0; i < config.objects.length; i++) {
                copy.objects.push(BlakeObject.create(config.objects[i]));
            }
        }
        return copy;
    };

    return GenericService(constructor);
}]);

angular.module('blake').factory("BlakeWork", ['BlakeCopy','GenericService', function (BlakeCopy, GenericService) {
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
}]);

angular.module('blake').factory("BlakeFeaturedWork", ['GenericService', function (GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeFeaturedWork.
     *
     * @param config
     */
    var constructor = function (config) {
        return angular.copy(config);
    };

    return GenericService(constructor);
}]);

/**
 * For the time being, all data accessor functions should be placed here.  This service should mirror the API
 * of the back-end BlakeDataService.
 */
angular.module('blake').factory("BlakeDataService", ['$http', '$q', '$rootScope', 'BlakeWork', 'BlakeCopy', 'BlakeObject', 'BlakeFeaturedWork', function ($http, $q, $rootScope, BlakeWork, BlakeCopy, BlakeObject, BlakeFeaturedWork) {
    var selectedWork, selectedCopy, selectedObject, selectedWorkCopies, selectedCopyObjects, queryObjects,
        getObject, getObjectsWithSameMotif, getObjectsFromSameMatrix, getObjectsFromSameProductionSequence,
        getCopy, getObjectsForCopy, getWork, getWorks, getCopiesForWork, getFeaturedWorks, setSelectedWork,
        setSelectedCopy, setSelectedObject, addComparisonObject, removeComparisonObject,
        clearComparisonObjects, isComparisonObject, comparisonObjects = [], hasObjectsWithSameMotif = false,
        hasObjectsFromSameMatrix = false, hasObjectsFromSameProductionSequence = false, objectSelectionChange;

    queryObjects = function (config) {
        var url = directoryPrefix + '/api/query_objects';
        return $q(function (resolve, reject) {
            $http.post(url, config).success(function (data) {
                resolve(data);
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    getObject = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId;
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeObject.create(data));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    objectSelectionChange = function () {
        hasObjectsFromSameMatrix = false;
        hasObjectsFromSameProductionSequence = false;
        hasObjectsWithSameMotif = false;
        $rootScope.$broadcast("objectSelectionChange")
    };

    getObjectsWithSameMotif = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId + '/objects_with_same_motif';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                if (data.results.length) {
                    hasObjectsWithSameMotif = true;
                }
                resolve(BlakeObject.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getObjectsFromSameMatrix = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId + '/objects_from_same_matrix';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                if (data.results.length) {
                    hasObjectsFromSameMatrix = true;
                }
                resolve(BlakeObject.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getObjectsFromSameProductionSequence = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId + '/objects_from_same_production_sequence';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                if (data.results.length) {
                    hasObjectsFromSameProductionSequence = true;
                }
                resolve(BlakeObject.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getCopy = function (copyId) {
        var url = directoryPrefix + '/api/copy/' + copyId;
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeCopy.create(data));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getObjectsForCopy = function (copyId) {
        var url = directoryPrefix + '/api/copy/' + copyId + '/objects';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeObject.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getWork = function (workId) {
        var url = directoryPrefix + '/api/work/' + workId;
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeWork.create(data));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getWorks = function () {
        var url = directoryPrefix + '/api/work/';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeWork.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getCopiesForWork = function (workId) {
        var url = directoryPrefix + '/api/work/' + workId + '/copies';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeCopy.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    getFeaturedWorks = function () {
        var url = directoryPrefix + '/api/featured_work/';
        return $q(function (resolve, reject) {
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

    setSelectedCopy = function (copyId, objectId) {
        return getCopy(copyId).then(function (copy) {
            selectedCopy = copy;
            $rootScope.$broadcast("copySelectionChange", copy);
            getObjectsForCopy(copyId).then(function (objects) {
                selectedCopyObjects = objects;
                if (objectId) {
                    objects.forEach(function (obj) {
                        if (obj.object_id == objectId) {
                            selectedObject = obj;
                        }
                    })
                } else {
                    selectedObject = objects[0];
                }
                $rootScope.$broadcast("copySelectionObjectsChange");
                objectSelectionChange();
            })
        })
    };

    setSelectedObject = function (objectId) {
        return getObject(objectId).then(function (obj) {
            selectedObject = obj;
            clearComparisonObjects();
            addComparisonObject(obj);
            objectSelectionChange();
        })
    };

    addComparisonObject = function (obj) {
        var i, objInList = false;
        // Don't add an object to the list twice
        for (i = comparisonObjects.length; i--;) {
            if (comparisonObjects[i].object_id == obj.object_id) {
                objInList = true;
                break;
            }
        }
        if (!objInList) {
            comparisonObjects.push(obj);
            $rootScope.$broadcast("comparisonObjectsChange");
        }
    };

    removeComparisonObject = function (obj) {
        var i;
        for (i = comparisonObjects.length; i--;) {
            if (comparisonObjects[i].object_id == obj.object_id) {
                comparisonObjects.splice(i, 1);
                $rootScope.$broadcast("comparisonObjectsChange");
                break;
            }
        }
    };

    clearComparisonObjects = function () {
        comparisonObjects = [];
        $rootScope.$broadcast("comparisonObjectsChange");
    };

    isComparisonObject = function (obj) {
        for (var i = comparisonObjects.length; i--;) {
            if (comparisonObjects[i].object_id == obj.object_id) {
                return true;
            }
        }
        return false;
    };

    return {
        queryObjects: queryObjects,
        getObject: getObject,
        getObjectsWithSameMotif: getObjectsWithSameMotif,
        hasObjectsWithSameMotif: function () {
            return hasObjectsWithSameMotif;
        },
        getObjectsFromSameMatrix: getObjectsFromSameMatrix,
        hasObjectsFromSameMatrix: function () {
            return hasObjectsFromSameMatrix;
        },
        getObjectsFromSameProductionSequence: getObjectsFromSameProductionSequence,
        hasObjectsFromSameProductionSequence: function () {
            return hasObjectsFromSameProductionSequence;
        },
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
        },
        addComparisonObject: addComparisonObject,
        removeComparisonObject: removeComparisonObject,
        clearComparisonObjects: clearComparisonObjects,
        getComparisonObjects: function () {
            return comparisonObjects;
        },
        isComparisonObject: isComparisonObject
    };
}]);

/**
 * This is a mock version of the BlakeDataService, which can be used for testing.
 */
angular.module('blake').factory("MockBlakeDataService", ['$http', '$q', 'BlakeWork', 'BlakeCopy', 'BlakeObject', 'BlakeFeaturedWork', function ($http, $q, BlakeWork, BlakeCopy, BlakeObject, BlakeFeaturedWork) {
    var getObjects = function () {
        return $q(function (resolve, reject) {
            $http.get(directoryPrefix + '/static/json/objects.json').success(function (data) {
                resolve(BlakeObject.create(data));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getObject = function () {
        return $q(function (resolve, reject) {
            $http.get(directoryPrefix + '/static/json/objects.json').success(function (data) {
                resolve(BlakeObject.create(data[0]));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getCopies = function () {
        return $q(function (resolve, reject) {
            $http.get(directoryPrefix + '/static/json/copies.json').success(function (data) {
                resolve(BlakeCopy.create(data));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getCopy = function () {
        return $q(function (resolve, reject) {
            $http.get(directoryPrefix + '/static/json/copies.json').success(function (data) {
                resolve(BlakeCopy.create(data[0]));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getWorks = function () {
        return $q(function (resolve, reject) {
            $http.get(directoryPrefix + '/static/json/works.json').success(function (data) {
                resolve(BlakeWork.create(data));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getWork = function () {
        return $q(function (resolve, reject) {
            $http.get(directoryPrefix + '/static/json/works.json').success(function (data) {
                resolve(BlakeWork.create(data[0]));
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    var getFeaturedWorks = function () {
        return $q(function (resolve, reject) {
            $http.get(directoryPrefix + '/static/json/featured_works.json').success(function (data) {
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
}]);

angular.module('blake').factory("FormatService", function () {
    var cap = function(full_text) {
        if(/\s+copy\s+/.test(full_text)) {
            return full_text.replace(/copy/, 'Copy');
        }
      return false;
    };

    return {
        cap: function() {
            return cap();
        }
    }
});

angular.module('blake').factory("UtilityServices", function() {
    var responseChange = function() {
        var response_change = {};

        response_change.waitForIdle = function(fn, delay) {
          var timer = null;
          return function () {
            var context = this,
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
              fn.apply(context, args);
            }, delay);
          };
        };

        return response_change;
    };

    // Set the max-height for the detail tray in object view.
    var trayHeight = function(selector) {
        var set_tray_height = selector.height();
        var panel_count = $('.panel-group .panel-default').length;
        var set_tray_body_height = (set_tray_height - (panel_count * 47));

        $('.panel-group').css('min-height', set_tray_height + 'px');
        $('.panel-group .panel-body').css('max-height', set_tray_body_height + 'px');
    };

    /**
     *
     * @param set_delay in milliseconds
     * * Get the height of the object detail.
     * Pretty awkward solution to the way Design Hammer set this up. Image loaded via Ajax, so need a delay to execute getting correct height
     */
    var getImageHeight = function(set_delay, $timeout) {
       angular.element(document).ready(function () {
            $timeout(function() {
                var response_change = responseChange();
                var object_view = $("#object-view");

                // Set the max-height for the detail tray in object view.
                if ( $('#object-detail-tray').length ) {
                    trayHeight(object_view);
                    object_view.resize(response_change.waitForIdle(function() {
                        trayHeight(object_view);
                    }, 10));
                }
            }, set_delay);
       });
    };

    /**
     * Toggle the info tray open and shut
     */
    var togglingTray = function() {
        var $detail_tray = $('#object-container');

        if ($detail_tray.hasClass('tray-closed')) {
            $detail_tray.removeClass('tray-closed').addClass('tray-open');
            setTimeout(function () {
                $('.scrollbar').scroller('reset');
            }, 300);
            $('.scrollbar').scroller('reset');
        } else {
            $detail_tray.removeClass('tray-open').addClass('tray-closed');
            $('.scrollbar').scroller('reset');
            setTimeout(function () {
                $('.scrollbar').scroller('reset');
            }, 300);
        }
    };

    var imageText = function($scope, objLines) {
        $scope.obj.text.lg.forEach(function (lg) {
            if (lg.l.length) {
                lg.l.forEach(function (l) {
                    objLines.push(l["#text"]);
                })
            } else {
                objLines.push(lg.l["#text"])
            }
        });

        return objLines;
    };

    var imageViewerHeight = function() {
        var viewer_height = $(window).innerHeight();
        var offset = Math.round(viewer_height * .35);
        return viewer_height - offset;
    };

    var fullScreen = function(Fullscreen, panel_id) {
        var selector = $('.panel-group .panel-body');

        if (Fullscreen.isEnabled()) {
            Fullscreen.cancel();
        } else {
            var set_tray_height = selector.css('max-height');
            localStorage.setItem('panel-height', set_tray_height);
            Fullscreen.enable(document.getElementById(panel_id));
            var max_size = $(window).innerWidth();
            var offset = Math.round(max_size * .3); // Need offset to show full text for long entries
            selector.css({'max-height': (max_size - offset) + 'px' });
        }
    };

    var resetPanelFromFullscreen = function(Fullscreen) {
        if (document.addEventListener) {
            document.addEventListener('webkitfullscreenchange', resetPanelSize, false);
            document.addEventListener('mozfullscreenchange', resetPanelSize, false);
            document.addEventListener('fullscreenchange', resetPanelSize, false);
            document.addEventListener('MSFullscreenChange', resetPanelSize, false);
        }

        function resetPanelSize() {
            if(!Fullscreen.isEnabled()) {
               // Reset to previous max height
                var height_property = localStorage.getItem('panel-height');
                localStorage.removeItem('panel-height');
                $('.panel-group .panel-body').css('max-height', height_property);
            }
        }
    };

    return {
        responseChange: responseChange,
        trayHeight: trayHeight,
        getImageHeight: getImageHeight,
        togglingTray: togglingTray,
        imageText: imageText,
        imageViewerHeight: imageViewerHeight,
        fullScreen: fullScreen,
        resetPanelFromFullscreen: resetPanelFromFullscreen
    }
});

angular.module('blake').controller("HomeController", ['$rootScope', '$scope', 'BlakeDataService', function ($rootScope, $scope, BlakeDataService) {
    $rootScope.showSubMenu = 0;
    BlakeDataService.getFeaturedWorks().then(function (results) {
        $scope.featured_works = results;
    });
}]);

angular.module('blake').controller("WorkController", ['$scope', '$routeParams', 'BlakeDataService', function ($scope, $routeParams, BlakeDataService) {
    BlakeDataService.setSelectedWork($routeParams.workId);
}]);

angular.module('blake').controller("ObjectController", ['$scope', '$routeParams', 'BlakeDataService', function ($scope, $routeParams, BlakeDataService) {
    BlakeDataService.setSelectedWork($routeParams.objectId);
}]);

angular.module('blake').controller("CopyController", ['$scope', '$routeParams', 'BlakeDataService', function ($scope, $routeParams, BlakeDataService) {
    BlakeDataService.setSelectedCopy($routeParams.copyId, $routeParams.objectId);
}]);

angular.module('blake').controller("SearchController", ['$rootScope', '$scope', '$location', '$routeParams', 'BlakeDataService', function ($rootScope, $scope, $location, $routeParams, BlakeDataService) {
    var objectMatchingMedium, workMatchingMedium;

    $rootScope.showSubMenu = 0;

    $scope.search = function () {
        BlakeDataService.queryObjects($scope.searchConfig).then(function (results) {
            $scope.results = results;
        });
    };

    $scope.loadSearchPage = function () {
        $location.url(directoryPrefix + "/search?search=" + encodeURIComponent($scope.searchText));
    };

    $scope.searchConfig = {
        useCompDate: true,
        searchTitle: true,
        searchIlluminatedBooks: true,
        searchCommercialBookIllustrations: true,
        searchSeparatePrints: true,
        searchDrawingsPaintings: true,
        searchManuscripts: true,
        searchRelatedMaterials: true,
        minDate: 1772,
        maxDate: 1827
    };

    objectMatchingMedium = function (result) {
        if ($scope.searchConfig.searchIlluminatedBooks && result.work_medium == "illbk") return true;
        if ($scope.searchConfig.searchCommercialBookIllustrations &&
            (result.work_medium == "comb" || result.work_medium == "comdes" || result.work_medium == "comeng")) return true;
        if ($scope.searchConfig.searchSeparatePrints &&
            (result.work_medium == "spb" || result.work_medium == "spdes" || result.work_medium == "speng")) return true;
        if ($scope.searchConfig.searchCommercialBookIllustrations &&
            (result.work_medium == "comb" || result.work_medium == "comdes" || result.work_medium == "comeng")) return true;
        if ($scope.searchConfig.searchDrawingsPaintings &&
            (result.work_medium == "cprint" || result.work_medium == "penc" || result.work_medium == "penink" ||
                result.work_medium == "mono" || result.work_medium == "wc" || result.work_medium == "paint")) return true;
        if ($scope.searchConfig.searchManuscripts &&
            (result.work_medium == "ms" || result.work_medium == "ltr" || result.work_medium == "te")) return true;
        if ($scope.searchConfig.searchRelatedMaterials &&
            (result.work_medium == "rmb" || result.work_medium == "rmoth")) return true;
        return false;
    };

    workMatchingMedium = function (result) {
        if ($scope.searchConfig.searchIlluminatedBooks && result.medium == "illbk") return true;
        if ($scope.searchConfig.searchCommercialBookIllustrations &&
            (result.medium == "comb" || result.medium == "comdes" || result.medium == "comeng")) return true;
        if ($scope.searchConfig.searchSeparatePrints &&
            (result.medium == "spb" || result.medium == "spdes" || result.medium == "speng")) return true;
        if ($scope.searchConfig.searchCommercialBookIllustrations &&
            (result.medium == "comb" || result.medium == "comdes" || result.medium == "comeng")) return true;
        if ($scope.searchConfig.searchDrawingsPaintings &&
            (result.medium == "cprint" || result.medium == "penc" || result.medium == "penink" ||
                result.medium == "mono" || result.medium == "wc" || result.medium == "paint")) return true;
        if ($scope.searchConfig.searchManuscripts &&
            (result.medium == "ms" || result.medium == "ltr" || result.medium == "te")) return true;
        if ($scope.searchConfig.searchRelatedMaterials &&
            (result.medium == "rmb" || result.medium == "rmoth")) return true;
        return false;
    };
    
    $scope.objectResultsMatchingFilter = function (resultType) {
        var i, inRange = [], results;
        if ($scope.results) {
            results = $scope.results.object_results[resultType];
            for (i = 0; i < results.length; i++) {
                if (results[i].copy_composition_date >= $scope.searchConfig.minDate &&
                    results[i].copy_composition_date <= $scope.searchConfig.maxDate &&
                    objectMatchingMedium(results[i])) {
                    inRange.push(results[i]);
                }
            }
        }
        return inRange;
    };

    $scope.workResultsMatchingFilter = function (resultType) {
        var i, inRange = [], results;
        if ($scope.results) {
            results = $scope.results.work_results[resultType];
            for (i = 0; i < results.length; i++) {
                if (results[i].composition_date >= $scope.searchConfig.minDate &&
                    results[i].composition_date <= $scope.searchConfig.maxDate &&
                    workMatchingMedium(results[i])) {
                    inRange.push(results[i]);
                }
            }
        }
        return inRange;
    };

    if ($routeParams.search) {
        $scope.searchConfig.searchString = $routeParams.search;
        $scope.search();
    }

    $scope.showWorks = true;
    $scope.showCopies = true;
    $scope.showObjects = true;
}]);

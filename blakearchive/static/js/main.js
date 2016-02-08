directoryPrefix = '/blake';

angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q',
        function ($scope, $timeout, $transition, $q) {
        }]).directive('carousel', [function () {
        return {}
    }]);


angular.module('blake',['ngRoute', 'ngSanitize', 'ui-rangeSlider', 'ui.bootstrap', 'ng-sortable', 'FBAngular', 'ngAnimate'])

.factory("GenericService", function () {
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
})

.factory("BlakeObject", ['GenericService', function (GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeObject.
     *
     * @param config
     */

    var parseObjectLines = function(object,array){

        if(angular.isArray(object)) {
            angular.forEach(object, function (objectSet, lineKey) {
                if (angular.isArray(objectSet.l)) {
                    angular.forEach(objectSet.l, function (v, k) {
                        var indent = angular.isDefined(v['@indent']) ? v['@indent'] : 0;
                        array.push({'indent': indent, 'text': v['#text']})
                    });
                } else {
                    var indent = angular.isDefined(objectSet.l['@indent']) ? objectSet.l['@indent'] : 0;

                    if (angular.isDefined(objectSet.l.physnumber)) {
                        array.push({'indent': indent, 'text': objectSet.l.physnumber['#text']})
                    } else {
                        array.push({'indent': indent, 'text': objectSet.l['#text']})
                    }
                }
            });
        } else if (angular.isArray(object.l)){
            angular.forEach(object.l, function (v, k) {
                var indent = angular.isDefined(v['@indent']) ? v['@indent'] : 0;
                array.push({'indent': indent, 'text': v['#text']});
            });
        } else {
            var indent = angular.isDefined(object.l['@indent']) ? object.l['@indent'] : 0;

            if (angular.isDefined(object.l.physnumber)) {
                array.push({'indent': indent, 'text': object.l.physnumber['#text']});
            } else {
                array.push({'indent': indent, 'text': object.l['#text']});
            }
        }
    };


    var constructor = function (config) {
        var obj = angular.copy(config);
        if(obj){
            obj.illustration_description = angular.fromJson(config.illustration_description);
            obj.characteristics = angular.fromJson(config.characteristics);
            obj.text = angular.fromJson(config.text);
            obj.notes = angular.fromJson(config.notes);
            obj.lines = [];
            if(angular.isObject(obj.text)){
                if(angular.isDefined(obj.text.texthead)){
                    parseObjectLines(obj.text.texthead,obj.lines);
                }

                if(angular.isDefined(obj.text.lg)){
                    parseObjectLines(obj.text.lg,obj.lines);
                }

            }
            obj.header = angular.fromJson(config.header);
            obj.source = angular.fromJson(config.source);

            return obj;
        }

    };

    return GenericService(constructor);
}])

.factory("BlakeCopy", ['BlakeObject', 'GenericService', function (BlakeObject, GenericService) {
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
}])

.factory("BlakeWork", ['BlakeCopy','GenericService', function (BlakeCopy, GenericService) {
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
}])

.factory("BlakeFeaturedWork", ['GenericService', function (GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeFeaturedWork.
     *
     * @param config
     */
    var constructor = function (config) {
        return angular.copy(config);
    };

    return GenericService(constructor);
}])

.factory("BlakeDataService", ['$http', '$q', '$rootScope', 'BlakeWork', 'BlakeCopy', 'BlakeObject', 'BlakeFeaturedWork', function ($http, $q, $rootScope, BlakeWork, BlakeCopy, BlakeObject, BlakeFeaturedWork) {
    /**
     * For the time being, all data accessor functions should be placed here.  This service should mirror the API
     * of the back-end BlakeDataService.
     */

    var dataFactory = {};
    /*var selectedWork, selectedCopy, selectedObject, selectedWorkCopies, selectedCopyObjects, queryObjects,
        getObject, getObjectsWithSameMotif, getObjectsFromSameMatrix, getObjectsFromSameProductionSequence,
        getCopy, getObjectsForCopy, getWork, getWorks, getCopiesForWork, getFeaturedWorks, setSelectedWork,
        setSelectedCopy, setSelectedObject, addComparisonObject, removeComparisonObject,
        clearComparisonObjects, isComparisonObject, comparisonObjects = [], hasObjectsWithSameMotif = false,
        hasObjectsFromSameMatrix = false, hasObjectsFromSameProductionSequence = false, objectSelectionChange;*/

    /**
     *
     * @param config - The search configuration
     * @param config.searchTitle - Perform a title search (both Object and Work)
     * @param config.workTitleOffset - An optional offset to use for work title search results, for pagination
     * @param config.objectTitleOffset - An optional offset to use for work title search results, for pagination
     * @param config.searchWorkInformation - Perform a work information search
     * @param config.workInformationOffset - An optional offset to use for work information search results, for pagination
     * @param config.searchImageKeywords - Perform an image keyword search
     * @param config.objectKeywordOffset - an optional offset to use for image keyword search results, for pagination
     * @param config.searchText - perform an object text search
     * @param config.searchTextOffset - optional offset to use for text search results, for pagination
     * @param config.searchImageDescription - perform an image description search
     * @param config.objectDescriptionOffset - an optional offset to use for description search results
     * @returns {*}
     */

    dataFactory.queryObjects = function (config) {
        var url = directoryPrefix + '/api/query_objects';
        return $q(function (resolve, reject) {
            $http.post(url, config).success(function (data) {
                resolve(data);
            }).error(function (data, status) {
                reject(data, status);
            });
        });
    };

    dataFactory.getObject = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId;
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeObject.create(data));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };


    dataFactory.getObjectsWithSameMotif = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId + '/objects_with_same_motif';
        //console.log('getting motif');
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                dataFactory.hasObjectsWithSameMotif = data.results.length ? true : false;
                /*if (data.results.length) {
                    dataFactory.hasObjectsWithSameMotif = true;
                }*/
                resolve(BlakeObject.create(data.results));
                //console.log('resolved motif');
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    dataFactory.getObjectsFromSameMatrix = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId + '/objects_from_same_matrix';
        //console.log('getting matrix');
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                dataFactory.hasObjectsFromSameMatrix = data.results.length ? true : false;
                /*if (data.results.length) {
                    dataFactory.hasObjectsFromSameMatrix = true;
                }*/
                resolve(BlakeObject.create(data.results));
                //console.log('resolved matrix');
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    dataFactory.getObjectsFromSameProductionSequence = function (objectId) {
        var url = directoryPrefix + '/api/object/' + objectId + '/objects_from_same_production_sequence';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                dataFactory.hasObjectsFromSameProductionSequence = data.results.length ? true : false;
                /*if (data.results.length) {
                    dataFactory.hasObjectsFromSameProductionSequence = true;
                }*/
                resolve(BlakeObject.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    dataFactory.getCopy = function (copyId) {
        var url = directoryPrefix + '/api/copy/' + copyId;
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeCopy.create(data));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    dataFactory.getObjectsForCopy = function (copyId) {
        var url = directoryPrefix + '/api/copy/' + copyId + '/objects';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeObject.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    dataFactory.getWork = function (workId) {
        var url = directoryPrefix + '/api/work/' + workId;
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeWork.create(data));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    dataFactory.getWorks = function () {
        var url = directoryPrefix + '/api/work/';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeWork.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    dataFactory.getCopiesForWork = function (workId) {
        var url = directoryPrefix + '/api/work/' + workId + '/copies';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeCopy.create(data.results));
            }).error(function (data, status) {
                reject(data, status);
            })
        });
    };

    dataFactory.getFeaturedWorks = function () {
        var url = directoryPrefix + '/api/featured_work/';
        return $q(function (resolve, reject) {
            $http.get(url).success(function (data) {
                resolve(BlakeFeaturedWork.create(data.results));
            }).error(function (data, status) {
                reject(data, status)
            })
        });
    };

    dataFactory.setSelectedWork = function (workId) {
        return dataFactory.getWork(workId).then(function (work) {
            dataFactory.selectedWork = work;
            dataFactory.getCopiesForWork(workId).then(function (copies) {
                dataFactory.selectedWorkCopies = copies;
                $rootScope.$broadcast("update:work");
                console.log('update:work fired');
            })
        }).catch(function(){
                var splitWorkId = workId.split('.');
                dataFactory.getWork(splitWorkId[0]).then(function (work) {
                    dataFactory.selectedWork = work;
                    $rootScope.$broadcast("update:work");
                    console.log('update:work fired');
                    dataFactory.getCopiesForWork(splitWorkId[0]).then(function (copies) {
                        dataFactory.selectedWorkCopies = copies;
                    })
                }).catch(function(){
                    dataFactory.selectedWork = {};
                })
        });

    };

    dataFactory.setSelectedCopy = function (copyId, objectId) {
        return $q.all([
            dataFactory.getCopy(copyId),
            dataFactory.getObjectsForCopy(copyId),
        ]).then(function(data){
            dataFactory.selectedCopy = data[0];
            dataFactory.selectedCopyObjects = data[1];
            if (objectId) {
                data[1].forEach(function (obj) {
                    if (obj.object_id == objectId) {
                        dataFactory.selectedObject = obj;
                    }
                })
            } else {
                dataFactory.selectedObject = data[1][0];
            }
            $rootScope.$broadcast("update:copy");
            console.log('update copy fired');
            dataFactory.objectSelectionChange();
        })
    };

    dataFactory.setSelectedObject = function (objectId) {
        return dataFactory.getObject(objectId).then(function (obj) {
            dataFactory.selectedObject = obj;
            //dataFactory.clearComparisonObjects();
            //dataFactory.addComparisonObject(obj);
            dataFactory.objectSelectionChange();
        })
    };

    dataFactory.objectSelectionChange = function () {
        return $q.all([
            dataFactory.getObjectsFromSameMatrix(dataFactory.selectedObject.object_id),
            dataFactory.getObjectsFromSameProductionSequence(dataFactory.selectedObject.object_id),
            dataFactory.getObjectsWithSameMotif(dataFactory.selectedObject.object_id)
        ]).then(function(data){
            dataFactory.sameMatrix = data[0];
            dataFactory.sameSequence = data[1];
            dataFactory.sameMotif = data[2];
            $rootScope.$broadcast("update:object");
            console.log('update:object fired');
        })
    };

    dataFactory.addComparisonObject = function (obj) {
        var i, objInList = false;
        // Don't add an object to the list twice
        for (i = dataFactory.comparisonObjects.length; i--;) {
            if (dataFactory.comparisonObjects[i].object_id == obj.object_id) {
                objInList = true;
                break;
            }
        }
        if (!objInList) {
            dataFactory.comparisonObjects.push(obj);
        }
        $rootScope.$broadcast("update:comparison");
        console.log('update:comparison fired');
    };

    dataFactory.removeComparisonObject = function (obj) {
        var i;
        for (i = dataFactory.comparisonObjects.length; i--;) {
            if (dataFactory.comparisonObjects[i].object_id == obj.object_id) {
                dataFactory.comparisonObjects.splice(i, 1);
                break;
            }
        }
        $rootScope.$broadcast("update:comparison");
        console.log('update:comparison fired');
    };

    dataFactory.clearComparisonObjects = function () {
        dataFactory.comparisonObjects = [];
        $rootScope.$broadcast("update:comparison");
        console.log('update:comparison fired');
    };

    dataFactory.isComparisonObject = function (obj) {
        for (var i = dataFactory.comparisonObjects.length; i--;) {
            if (dataFactory.comparisonObjects[i].object_id == obj.object_id) {
                return true;
            }
        }
        return false;
    };

    return dataFactory;
}])

.factory("FormatService", function () {
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
})

.factory("UtilityServices", function() {

    /*var responseChange = function() {
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
    };*/

    // Set the max-height for the detail tray in object view.
    /*var trayHeight = function(selector) {
        var set_tray_height = selector.height();
        var panel_count = $('.panel-group .panel-default').length;
        var set_tray_body_height = (set_tray_height - (panel_count * 47));

        $('.panel-group').css('min-height', set_tray_height + 'px');
        $('.panel-group .panel-body').css('max-height', set_tray_body_height + 'px');
    };*/

    /**
     *
     * @param set_delay in milliseconds
     * * Get the height of the object detail.
     * Pretty awkward solution to the way Design Hammer set this up. Image loaded via Ajax, so need a delay to execute getting correct height
     */
    /*var getImageHeight = function(set_delay, $timeout) {
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
    };*/


    /*var imageText = function($scope, objLines) {
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
    };*/

    /*var imageViewerHeight = function() {
        var viewer_height = $(window).innerHeight();
        var offset = Math.round(viewer_height * .35);
        return viewer_height - offset;
    };*/

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
        //responseChange: responseChange,
        //trayHeight: trayHeight,
        //getImageHeight: getImageHeight,
        //imageText: imageText,
        //imageViewerHeight: imageViewerHeight,
        fullScreen: fullScreen,
        resetPanelFromFullscreen: resetPanelFromFullscreen
    }
})

.factory('WindowSize',['$window',function($window){
    var windowSize = {},
        w = angular.element($window);

    windowSize.height = w.height();
    windowSize.width = w.width();

    return windowSize;
}])
.directive('resize', ['$window', '$timeout', 'WindowSize', function($window, $timeout, WindowSize ) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return {
                'h': w.height(),
                'w': w.width()
            };
        };

        //scope.getWindowDimensions();

        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            $timeout.cancel(scope.resizing);

            // Add a timeout to not call the resizing function every pixel
            scope.resizing = $timeout( function() {
                WindowSize.height = newValue.h;
                WindowSize.width = newValue.w;
                scope.$broadcast('resize::resize', { height: WindowSize.height, width : WindowSize.width });
            }, 300);


        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }

}])
.directive('copyImage', ['WindowSize', function(WindowSize){
        var link = function(scope, element, attrs) {

            scope.setStyles = function(windowSize){
                var newHeight = (windowSize.height - 270);
                element.height(newHeight);
            }

            element.on('load',function(){
                scope.setStyles(WindowSize);
            })

            scope.$on('resize::resize', function(e,w) {
                scope.setStyles(w)
            });
            scope.$on('copyCtrl::toggleTools',function(e,d){
                var adjustment = d.tools == true ? -50 : 50 ;
                element.height(element.height() + adjustment);
            })
        };
        return {
            restrict: 'A',
            link: link
        };
}])
.directive('comparisonImage', ['WindowSize', function(WindowSize){
    var link = function(scope, element, attrs) {

        var baseAdjustment = 370;

        scope.setStyles = function(windowSize, adjustment){
            var elementHeight = element.height(),
                elementWidth = element.width(),
                ratio = elementWidth / elementHeight,
                newHeight = (windowSize.height - adjustment),
                newWidth = Math.ceil(newHeight * ratio);
                element.css('height',newHeight);
                element.parent().css('width',newWidth);
        }

        element.on('load',function(){
            scope.setStyles(WindowSize,baseAdjustment);
        })

        scope.$on('resize::resize', function(e,w) {
            scope.setStyles(w,baseAdjustment)
        });

        scope.$on('compareCtrl::toggleTools',function(e,d){
            var adjustment = d.tools == true ? baseAdjustment : baseAdjustment - 112 ;
            scope.setStyles(WindowSize,adjustment)
        })

    };
    return {
        restrict: 'A',
        link: link
    };
}])

/***
 * this is an attempt to angularize the scroll to top button. Two problems
 *      1. it only works on the homepage....ummm....?
 *      2. angular doesn't have anyway to smooth scroll to the top without running a shit ton of math and timeouts...
 *      so we're just going to use jquery for now

.directive('scroll', function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
            if (this.pageYOffset >= 50) {

                scope.showToTop = true;
            } else {
                scope.showToTop = false;
            }
            scope.test = this.pageYOffset;
        });
    };
})

***/

.directive('parallax', function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
            scope.$broadcast('scroll::scroll', {'offset':this.pageYOffset});
        });
    };
})
/*.controller("HomeController", ['$rootScope', '$scope', 'BlakeDataService', function ($rootScope, $scope, BlakeDataService) {
    $rootScope.showSubMenu = 0;
    BlakeDataService.getFeaturedWorks().then(function (results) {
        var i = 0,
            sci = 1;
        angular.forEach(results, function(value) {
            value.column = sci;
            ++i;
            if(i == 4){
                ++sci;
                i = 0;
            }
        });
        $scope.featured_works = results;
        $rootScope.homePageOverride = true;
    });
}])*/

/*.controller("WorkController", ['$scope', '$routeParams', 'BlakeDataService', function ($scope, $routeParams, BlakeDataService) {
    BlakeDataService.setSelectedWork($routeParams.workId);
}])*/

.controller("ObjectController", ['$scope', '$routeParams', 'BlakeDataService', function ($rootScope, $scope, BlakeDataService) {
    BlakeDataService.setSelectedWork($routeParams.objectId);
}])

.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.when(directoryPrefix + '/', {
        templateUrl: directoryPrefix + '/static/controllers/home/home.html',
        controller: "HomeController",
        controllerAs: 'home'
    });
    $routeProvider.when(directoryPrefix + '/object/:objectId', {
        templateUrl: directoryPrefix + '/static/html/object.html',
        controller: "ObjectController"
    });
    $routeProvider.when(directoryPrefix + '/copy/:copyId', {
        templateUrl: directoryPrefix + '/static/controllers/copy/copy.html',
        controller: "CopyController",
        controllerAs: 'copyCtrl'
    });
    $routeProvider.when(directoryPrefix + '/copy/:copyId/:objectId', {
        templateUrl: directoryPrefix + '/static/controllers/copy/copy.html',
        controller: "CopyController",
        controllerAs: 'copyCtrl'

    });
    $routeProvider.when(directoryPrefix + '/work/:workId', {
        templateUrl: directoryPrefix + '/static/controllers/work/work.html',
        controller: "WorkController",
        controllerAs: 'workCtrl'
    });
    $routeProvider.when(directoryPrefix + '/compare/', {
        templateUrl: directoryPrefix + '/static/controllers/compare/compare.html',
        controller: "CompareController",
        controllerAs: 'compareCtrl'
    });
    $routeProvider.when(directoryPrefix + '/search/', {
        templateUrl: directoryPrefix + '/static/controllers/search/search.html',
        controller: "SearchController"
    });

    $routeProvider.otherwise({redirectTo: directoryPrefix + '/'});
    $locationProvider.html5Mode(true);
}]);
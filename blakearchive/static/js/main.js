directoryPrefix = '/blake';

angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q',
        function ($scope, $timeout, $transition, $q) {
        }]).directive('carousel', [function () {
    return {}
}]);


angular.module('blake', ['ngRoute', 'ngSanitize', 'ui-rangeSlider', 'ui.bootstrap', 'ng-sortable', 'FBAngular', 'ngAnimate', 'ngStorage'])

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

        var parseObjectLines = function (object, array, type, colnum) {
            if (angular.isArray(object)) {
                angular.forEach(object, function (objectSet, lineKey) {
                    if (angular.isArray(objectSet.l)) {
                        angular.forEach(objectSet.l, function (v, k) {
                            var indent = angular.isDefined(v['@indent']) ? v['@indent'] : 0;
                            array.push({
                                'indent': indent,
                                'text': v['#text'],
                                'lineNum': v['@n'],
                                'justify': v['@justify'],
                                'type': type,
                                'colnum': colnum
                            })
                        });
                    } else {
                        var indent = angular.isDefined(objectSet.l['@indent']) ? objectSet.l['@indent'] : 0;

                        if (angular.isDefined(objectSet.l.physnumber)) {
                            array.push({
                                'indent': indent,
                                'text': objectSet.l.physnumber['#text'],
                                'lineNum': objectSet.l['@n'],
                                'justify': objectSet.l['@justify'],
                                'type': type,
                                'colnum': colnum
                            });
                        } else if (angular.isDefined(objectSet.l.catchword)) {
                            array.push({
                                'indent': indent,
                                'text': objectSet.l.catchword['#text'],
                                'lineNum': objectSet.l['@n'],
                                'justify': objectSet.l['@justify'],
                                'type': type,
                                'colnum': colnum
                            });
                        } else {
                            array.push({
                                'indent': indent,
                                'text': objectSet.l['#text'],
                                'lineNum': objectSet.l['@n'],
                                'justify': objectSet.l['@justify'],
                                'type': type,
                                'colnum': colnum
                            });
                        }
                    }
                });
            } else if (angular.isArray(object.l)) {
                angular.forEach(object.l, function (v, k) {
                    var indent = angular.isDefined(v['@indent']) ? v['@indent'] : 0;
                    array.push({
                        'indent': indent,
                        'text': v['#text'],
                        'lineNum': v['@n'],
                        'justify': v['@justify'],
                        'type': type,
                        'colnum': colnum
                    });
                });
            } else {
                var indent = angular.isDefined(object.l['@indent']) ? object.l['@indent'] : 0;

                if (angular.isDefined(object.l.physnumber)) {
                    array.push({
                        'indent': indent,
                        'text': object.l.physnumber['#text'],
                        'lineNum': object.l['@n'],
                        'justify': object.l['@justify'],
                        'type': type,
                        'colnum': colnum
                    });
                } else if (angular.isDefined(object.l.catchword)) {
                    array.push({
                        'indent': indent,
                        'text': object.l.catchword['#text'],
                        'lineNum': object.l['@n'],
                        'justify': object.l['@justify'],
                        'type': type,
                        'colnum': colnum
                    });
                } else {
                    array.push({
                        'indent': indent,
                        'text': object.l['#text'],
                        'lineNum': object.l['@n'],
                        'justify': object.l['@justify'],
                        'type': type,
                        'colnum': colnum
                    });
                }
            }
        };


        var constructor = function (config) {
            var obj = angular.copy(config);
            if (obj) {
                obj.illustration_description = angular.fromJson(config.illustration_description);
                obj.characteristics = angular.fromJson(config.characteristics);
                obj.text = angular.fromJson(config.text);
                obj.notes = angular.fromJson(config.notes);
                obj.lines = [];
                /*if (angular.isObject(obj.text)) {
                    if (angular.isDefined(obj.text.texthead)) {
                        parseObjectLines(obj.text.texthead, obj.lines, 'header', 0);
                    }

                    if (angular.isDefined(obj.text.columns)) {
                        var inc = 1;
                        angular.forEach(obj.text.columns.column, function (v, k) {
                            if (angular.isDefined(v.texthead)) {
                                parseObjectLines(v.texthead, obj.lines, 'header', inc);
                            }
                            if (angular.isDefined(v.lg)) {
                                parseObjectLines(v.lg, obj.lines, 'body', inc);
                            }
                            if (angular.isDefined(v.textfoot)) {
                                parseObjectLines(v.textfoot, obj.lines, 'footer', inc);
                            }
                            //obj.lines.columns.push({'num':inc,'column':columnArray});
                            inc++;
                        });
                    }

                    if (angular.isDefined(obj.text.lg)) {
                        parseObjectLines(obj.text.lg, obj.lines, 'body', 0);
                    }

                    if (angular.isDefined(obj.text.textfoot)) {
                        parseObjectLines(obj.text.textfoot, obj.lines, inc);
                    }

                }
                obj.lines.sort(function (a, b) {
                    if (a.lineNum > b.lineNum) {
                        return 1;
                    }
                    if (a.lineNum < b.lineNum) {
                        return -1;
                    }
                    return 0;
                });*/
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
            var copy = angular.copy(config);
            copy.header = angular.fromJson(config.header);
            copy.source = angular.fromJson(config.source);

            /*if (config.objects) {
             for (i = 0; i < config.objects.length; i++) {
             copy.objects.push(BlakeObject.create(config.objects[i]));
             }
             }*/
            switch (copy.archive_copy_id) {
                case 'biblicalwc':
                case 'biblicaltemperas':
                case 'but543':
                case 'letters':
                case 'gravepd':
                case 'gravewc':
                case 'cpd':
                case 'allegropenseroso':
                    copy.virtual = true;
                    break;
                default:
                    copy.virtual = false;
                    break;
            }

            return copy;
        };

        return GenericService(constructor);
    }])

    .factory("BlakeWork", ['BlakeCopy', 'GenericService', function (BlakeCopy, GenericService) {
        /**
         * Constructor takes a config object and creates a BlakeWork, with child objects transformed into the
         * BlakeCopies.
         *
         * @param config
         */
        var constructor = function (config) {

            var work = angular.copy(config);
            /*if (config.copies) {
             for (i = 0; i < config.copies.length; i++) {
             work.copies.push(BlakeCopy.create(config.copies[i]));
             }
             }*/

            //Create an alternative work title for virtual works
            work.menuTitle = work.title;
            switch (work.bad_id) {
                case 'biblicalwc':
                    work.title = 'Water Color Drawings Illustrating the Bible';
                    work.virtual = true;
                    break;
                case 'biblicaltemperas':
                    work.title = 'Paintings Illustrating the Bible';
                    work.virtual = true;
                    break;
                case 'but543':
                    work.title = 'Illustrations to Milton\'s "On the Morning of Christ\'s Nativity"';
                    work.virtual = true;
                    break;
                case 'letters':
                case 'gravepd':
                case 'gravewc':
                case 'cpd':
                case 'allegropenseroso':
                    work.virtual = true;
                    break;
                default:
                    work.virtual = false;
                    break;
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

    .factory("BlakeDataService", ['$http', '$q', '$rootScope', 'BlakeWork', 'BlakeCopy', 'BlakeObject', 'BlakeFeaturedWork', '$localStorage', function ($http, $q, $rootScope, BlakeWork, BlakeCopy, BlakeObject, BlakeFeaturedWork, $localStorage) {
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
         * @param config.searchTitle - boolean, Perform a title search (both Object and Work)
         * @param config.workTitleOffset - An optional offset to use for work title search results, for pagination
         * @param config.searchWorkInformation - boolean, Perform a work information search
         * @param config.workInformationOffset - An optional offset to use for work information search results, for pagination
         * @param config.searchImageKeywords - boolean, Perform an image keyword search
         * @param config.searchText - boolean, perform an object text search
         * @param config.searchImageDescription - boolean, perform an image description search
         * @param config.searchIlluminatedBooks - boolean, include this medium type in the query
         * @param config.searchCommercialBookIllustrations - boolean, include this medium type in the query
         * @param config.searchSeparatePrints - boolean, include this medium type in the query
         * @param config.searchDrawingsPaintings - boolean, include this medium type in the query
         * @param config.searchManuscripts - boolean, include this medium type in the query
         * @param config.searchRelatedMaterials - boolean, include this medium type in the query
         * @param config.minDate - number, the lower bound of date ranges to include
         * @param config.maxDate - number, the upper bound of date ranges to include
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

        dataFactory.queryCopies = function (config) {
            var url = directoryPrefix + '/api/query_copies';
            return $q(function (resolve, reject) {
                $http.post(url, config).success(function (data) {
                    resolve(data);
                }).error(function (data, status) {
                    reject(data, status);
                });
            });
        };

        dataFactory.queryWorks = function (config) {
            var url = directoryPrefix + '/api/query_works';
            return $q(function (resolve, reject) {
                $http.post(url, config).success(function (data) {
                    resolve(data);
                }).error(function (data, status) {
                    reject(data, status);
                });
            });
        };

        dataFactory.getObject = function (objectId) {
            console.log('getting object');
            var url = directoryPrefix + '/api/object/' + objectId;
            return $q(function (resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeObject.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        };

        dataFactory.getObjects = function (objectIds) {
            console.log('getting objects');
            var url = directoryPrefix + '/api/object/';
            return $q(function (resolve, reject) {
                $http.get(url, {params: {object_ids: objectIds.join()}}).success(function (data) {
                    resolve(BlakeObject.create(data.results));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        };

        dataFactory.getObjectsWithSameMotif = function (objectId) {
            console.log('getting same motif');
            var url = directoryPrefix + '/api/object/' + objectId + '/objects_with_same_motif';
            //console.log('getting motif');
            return $q(function (resolve, reject) {
                $http.get(url).success(function (data) {
                    if (angular.isDefined(data.results)) {
                        resolve(BlakeObject.create(data.results));
                    }
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        };

        dataFactory.getObjectsFromSameMatrix = function (objectId) {
            console.log('getting same matrix');
            var url = directoryPrefix + '/api/object/' + objectId + '/objects_from_same_matrix';
            //console.log('getting matrix');
            return $q(function (resolve, reject) {
                $http.get(url).success(function (data) {
                    if (angular.isDefined(data.results)) {
                        resolve(BlakeObject.create(data.results));
                    }
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        };

        dataFactory.getObjectsFromSameProductionSequence = function (objectId) {
            console.log('getting same production');
            var url = directoryPrefix + '/api/object/' + objectId + '/objects_from_same_production_sequence';
            return $q(function (resolve, reject) {
                $http.get(url).success(function (data) {
                    if (angular.isDefined(data.results)) {
                        resolve(BlakeObject.create(data.results));
                    }
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        };

        dataFactory.getCopy = function (copyId) {
            console.log('getting copy');
            var url = directoryPrefix + '/api/copy/' + copyId;
            return $q(function (resolve, reject) {
                $http.get(url).success(function (data) {
                    resolve(BlakeCopy.create(data));
                }).error(function (data, status) {
                    reject(data, status);
                })
            });
        };

        dataFactory.getCopies = function (copyIds) {
            console.log('getting copies');
            var url = directoryPrefix + '/api/copy/';
            return $q(function (resolve, reject) {
                $http.get(url, {params: {bad_ids: copyIds.join()}}).success(function (data) {
                    resolve(BlakeCopy.create(data.results));
                }).error(function (data, status) {
                    reject(data, status);
                });
            });
        };

        dataFactory.getObjectsForCopy = function (copyId) {
            console.log('getting objects in copy');
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
            console.log('getting work');
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
            console.log('getting work (multiple)');
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
            console.log('getting copies in work');
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
            console.log('getting featured works');
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
            console.log('setting work');
            return $q.all([
                dataFactory.getWork(workId),
                dataFactory.getCopiesForWork(workId)
            ]).then(function (data) {
                dataFactory.selectedWork = data[0];
                dataFactory.selectedWork.copiesInWork = data[1];
                console.log(dataFactory.selectedWork);
                //dataFactory.selectedWorkCopies = data[1];
                //console.log(dataFactory.selectedWorkCopies);
            }).catch(function () {
                dataFactory.selectedWork = {};
            });
        };

        dataFactory.setWorkNoCopies = function (workId) {
            console.log('setting work no copies');
            return dataFactory.getWork(workId).then(function (data) {
                dataFactory.selectedWork = data;
            }).catch(function () {
                dataFactory.selectedWork = {};
            });
        };

        dataFactory.setSelectedCopy = function (copyId, objectId) {
            console.log('setting copy');
            return $q.all([
                dataFactory.getCopy(copyId),
                dataFactory.getObjectsForCopy(copyId),
            ]).then(function (data) {
                dataFactory.selectedCopy = data[0];
                dataFactory.selectedCopy.objectsInCopy = data[1];
                console.log(dataFactory.selectedCopy);

                //Programatically order objects if "copy" is a virtual group
                if (dataFactory.selectedCopy.virtual) {
                    var inc = 1;
                    data[1].forEach(function (obj) {
                        obj.object_number = inc;
                        inc++;
                    });
                }

                //Set the selected object
                if (objectId) {
                    data[1].forEach(function (obj) {
                        if (obj.object_id == objectId) {
                            dataFactory.selectedCopy.selectedObject = obj;
                        }
                    })
                } else {
                    dataFactory.selectedCopy.selectedObject = data[1][0]
                }
                //$rootScope.$broadcast("update:copy");
                //console.log('update copy fired');
                //dataFactory.objectSelectionChange();
                console.log('copy set');
            })
        };

        /*dataFactory.setCurrentObject = function(objectId){
         console.log('setting current object');
         if (objectId) {
         $localStorage.selectedCopy.forEach(function (obj) {
         if (obj.object_id == objectId) {
         $localStorage.currentObject = obj;
         }
         });
         }
         }*/

        dataFactory.setSelectedObject = function (objectId) {
            console.log('setting an object');
            return dataFactory.getObject(objectId).then(function (obj) {
                dataFactory.selectedObject = obj;
                console.log(dataFactory.selectedObject);
                //dataFactory.objectSelectionChange();
            })
        };

        /*dataFactory.objectSelectionChange = function () {
         return $q.all([
         dataFactory.getObjectsFromSameMatrix($localStorage.currentObject.object_id),
         dataFactory.getObjectsFromSameProductionSequence($localStorage.currentObject.object_id),
         dataFactory.getObjectsWithSameMotif($localStorage.currentObject.object_id)
         ]).then(function(data){
         $localStorage.sameMatrix = data[0];
         $localStorage.sameSequence = data[1];
         $localStorage.sameMotif = data[2];
         //$rootScope.$broadcast("update:object");
         //console.log('update:object fired');
         })
         };*/

        return dataFactory;
    }])

    .factory("FormatService", function () {
        var cap = function (full_text) {
            if (/\s+copy\s+/.test(full_text)) {
                return full_text.replace(/copy/, 'Copy');
            }
            return false;
        };

        return {
            cap: function () {
                return cap();
            }
        }
    })

    .factory('WindowSize', ['$window', function ($window) {
        var windowSize = {},
            w = angular.element($window);

        windowSize.height = w.height();
        windowSize.width = w.width();

        return windowSize;
    }])
    .directive('resize', ['$window', '$timeout', 'WindowSize', function ($window, $timeout, WindowSize) {
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
                scope.resizing = $timeout(function () {
                    WindowSize.height = newValue.h;
                    WindowSize.width = newValue.w;
                    scope.$broadcast('resize::resize', {height: WindowSize.height, width: WindowSize.width});
                }, 300);


            }, true);

            w.bind('resize', function () {
                scope.$apply();
            });
        }

    }])
    .directive('objectWindow', ['WindowSize', '$rootScope', function (WindowSize) {
        var link = function (scope, element, attrs) {

            scope.setStyles = function (windowSize) {
                if(WindowSize.width <= 992){
                    element.height('auto');
                } else {
                    var newHeight = (windowSize.height - scope.adjust);
                    element.height(newHeight);
                }
            }

            scope.setStyles(WindowSize);

            scope.$on('resize::resize', function (e, w) {
                scope.setStyles(w)
            });
        };
        return {
            restrict: 'A',
            link: link,
            scope: {
                'adjust': '@'
            }
        };
    }])

    .directive('parallax', function ($window) {
        return function (scope, element, attr) {
            angular.element($window).bind("scroll", function () {
                scope.$broadcast('scroll::scroll', {'offset': this.pageYOffset});
            });
        };
    })
    .directive('scrollToTop',function(){
        var link = function(scope,element,attr) {
            element.on('click',function(){
                $('html, body').animate({scrollTop: 0}, 'slow');
            })
        }
        return{
            restrict: 'A',
            link: link
        }
    })
    .directive('toTopButton',function($window){
        var link = function(scope,element,attr){
            angular.element($window).bind("scroll",function(){
                if(this.pageYOffset > 50){
                    element.addClass('scrolling')
                } else {
                    element.removeClass('scrolling')
                }
            })
        }
        return{
            restrict: 'A',
            link: link
        }
    })
    .directive('ovpImage',function(imageManipulation,$rootScope){
        var link = function(scope,element,attr){

            var image = angular.element(element.children()),
                container = angular.element(element.parent()),
                height = 0,
                width = 0,
                originalHeight = 0;

            image.on('load',function(){
                height = image.height();
                width = image.width();
                originalHeight = container.height();
            })

            scope.transformRotate = function(){
                if(width > height){
                    var padding = (width - height) / 2;
                    if((imageManipulation.transform.rotate % 180) != 0){
                        container.height(width);
                        element.width(width);
                        image.css({'height':'auto','width':'100%','margin-top':padding+'px'});
                        $rootScope.$broadcast('ovpImage::ovpIncrease',width-originalHeight);
                    } else {
                        container.height(originalHeight);
                        image.css({'height':'100%','width':'auto','margin-top':'0'});
                        $rootScope.$broadcast('ovpImage::ovpIncrease',0);
                    }
                }
                if(imageManipulation.transform.rotate == 0){
                    element.removeClass('rotated');
                } else {
                    element.addClass('rotated');
                }
            }

            scope.setStyles = function(){
                var tranformString = 'rotate('+imageManipulation.transform.rotate+'deg)';
                imageManipulation.transform.style['-webkit-transform'] = tranformString;
                imageManipulation.transform.style['-moz-tranform'] = tranformString;
                imageManipulation.transform.style['-o-transform'] = tranformString;
                imageManipulation.transform.style['-ms-transform'] = tranformString;
                imageManipulation.transform.style['transform'] = tranformString;
                element.css(imageManipulation.transform.style);
            }


            scope.$watch(function(){return imageManipulation.transform},function(){
                scope.transformRotate();
                scope.setStyles();
            },true);

            scope.$on('resize::resize',function(){
                scope.transformRotate();
                scope.setStyles();
            });


        }
        return{
            restrict: 'A',
            scope: {
                objectId: '@objectId'
            },
            link:link
        }
    })

    .factory('imageManipulation',function(){
        var imageManipulation = {};

        imageManipulation.transform = {
            'rotate':0,
            'scale':1,
            'style': {}
        }

        imageManipulation.rotate = function(){
            imageManipulation.transform.rotate = imageManipulation.transform.rotate + 90;
        }

        imageManipulation.reset = function(object_id){
            imageManipulation.transform = {
                'rotate':0,
                'scale':1,
                'style': {}
            }
        }

        return imageManipulation;
    })

    .filter('highlight',function($sce){
        return function(text,phrase){
            if(angular.isDefined(text)){
                if(phrase){
                    if(text){
                        text = text.replace(new RegExp('('+phrase+')','gi'),'<span class="highlighted">$1</span>');
                        return $sce.trustAsHtml(text);
                    } else {
                        return '';
                    }
                } else {
                    return $sce.trustAsHtml(text);
                }
            }
        }
    })

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
            controllerAs: 'copyCtrl',
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
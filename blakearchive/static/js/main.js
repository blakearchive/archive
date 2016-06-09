directoryPrefix = '/blake';

angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q',
        function ($scope, $timeout, $transition, $q) {
        }]).directive('carousel', [function () {
    return {}
}]);


angular.module('blake', ['ngRoute', 'ngSanitize', 'ui-rangeSlider', 'ui.bootstrap', 'ng-sortable', 'FBAngular', 'ngAnimate', 'ngStorage','ngCookies'])

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
                case 'gravewd':
                case 'cpd':
                case 'allegropenseroso':
                case 'miltons':
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
                    work.virtual = false;
                    break;
                case 'letters':
                case 'gravepd':
                case 'gravewc':
                case 'gravewd':
                case 'cpd':
                case 'allegropenseroso':
                case 'miltons':
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

    .factory("BlakeDataService", ['$log', '$http', '$q', '$location', 'BlakeWork', 'BlakeCopy', 'BlakeObject', 'BlakeFeaturedWork', function ($log, $http, $q, $location, BlakeWork, BlakeCopy, BlakeObject, BlakeFeaturedWork) {
        /**
         * For the time being, all data accessor functions should be placed here.  This service should mirror the API
         * of the back-end BlakeDataService.
         */

        var blakeData = {
            featured: {},
            work: {},
            workCopies: {},
            copy: {},
            copyObjects: {},
            object: {}
        };

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

        blakeData.queryObjects = function (config) {
            var url = directoryPrefix + '/api/query_objects';

            $log.info('query objects in solr');

            return $http.post(url, config)
                .then(queryObjectsComplete)
                .catch(queryObjectsFailed);

            function queryObjectsComplete(response){
                return response.data;
            }

            function queryObjectsFailed(error){
                $log.error('XHR Failed for queryObjects.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.queryCopies = function (config) {
            var url = directoryPrefix + '/api/query_copies';

            $log.info('query copies in solr');

            return $http.post(url, config)
                .then(queryCopiesComplete)
                .catch(queryCopiesFailed);

            function queryCopiesComplete(response){
                return response.data;
            }

            function queryCopiesFailed(error){
                $log.error('XHR Failed for queryCopies.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.queryWorks = function (config) {
            var url = directoryPrefix + '/api/query_works';

            $log.info('query works in solr');

            return $http.post(url, config)
                .then(queryWorksComplete)
                .catch(queryWorksFailed);

            function queryWorksComplete(response){
                return response.data;
            }

            function queryWorksFailed(error){
                $log.error('XHR Failed for queryWorks.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.getObject = function (descId) {
            var url = directoryPrefix + '/api/object/' + descId;

            $log.info('getting object');

            return $http.get(url)
                .then(getObjectComplete)
                .catch(getObjectFailed);

            function getObjectComplete(response){
                return BlakeObject.create(response.data);
            }

            function getObjectFailed(error){
                $log.error('XHR Failed for getObject.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.getObjects = function (descIds) {
            var url = directoryPrefix + '/api/object/';

            $log.info('getting objects: multi');

            return $http.get(url, {params: {desc_ids: descIds.join()}})
                .then(getObjectsComplete)
                .catch(getObjectsFailed);

            function getObjectsComplete(response){
                return BlakeObject.create(response.data.results);
            }

            function getObjectsFailed(error){
                $log.error('XHR Failed for getObjects: multi.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.getObjectsWithSameMotif = function (descId) {
            var url = directoryPrefix + '/api/object/' + descId + '/objects_with_same_motif';

            $log.info('getting objects w/ same motif');

            return $http.get(url)
                .then(getObjectsWithSameMotifComplete)
                .catch(getObjectsWithSameMotifFailed);

            function getObjectsWithSameMotifComplete(response){
                return BlakeObject.create(response.data.results);
            }

            function getObjectsWithSameMotifFailed(error){
                $log.error('XHR Failed for getObjectsWithSameMotif.\n' + angular.toJson(error.data, true));
            }

        };

        blakeData.getObjectsFromSameMatrix = function (descId) {
            var url = directoryPrefix + '/api/object/' + descId + '/objects_from_same_matrix';

            $log.info('getting objects from same matrix');

            return $http.get(url)
                .then(getObjectsFromSameMatrixComplete)
                .catch(getObjectsFromSameMatrixFailed);

            function getObjectsFromSameMatrixComplete(response){
                return BlakeObject.create(response.data.results);
            }

            function getObjectsFromSameMatrixFailed(error){
                $log.error('XHR Failed for getObjectsFromSameMatrix.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.getObjectsFromSameProductionSequence = function (descId) {
            var url = directoryPrefix + '/api/object/' + descId + '/objects_from_same_production_sequence';

            $log.info('getting objects from same production sequence');

            return $http.get(url)
                .then(getObjectsFromSameSequenceComplete)
                .catch(getObjectsFromSameSequenceFailed);

            function getObjectsFromSameSequenceComplete(response){
                return BlakeObject.create(response.data.results);
            }

            function getObjectsFromSameSequenceFailed(error){
                $log.error('XHR Failed for getObjectsFromSameProductionSequence.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.getCopy = function (copyId) {
            var url = directoryPrefix + '/api/copy/' + copyId;

            $log.info('getting copy');

            return $http.get(url)
                .then(getCopyComplete)
                .catch(getCopyFailed);

            function getCopyComplete(response){
                return BlakeCopy.create(response.data);
            }

            function getCopyFailed(error){
                $log.error('XHR Failed for getCopy.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.getCopies = function (copyIds) {
            var url = directoryPrefix + '/api/copy/';

            $log.info('getting copies: multi');

            return $http.get(url, {params: {bad_ids: copyIds.join()}})
                .then(getCopiesComplete)
                .catch(getCopiesFailed);

            function getCopiesComplete(response){
                return BlakeCopy.create(response.data.results);
            }

            function getCopiesFailed(error){
                $log.error('XHR Failed for getCopies: multi.\n' + angular.toJson(error.data, true));
            }

        };

        blakeData.getObjectsForCopy = function (copyId) {
            var url = directoryPrefix + '/api/copy/' + copyId + '/objects';

            $log.info('getting objects in copy');

            return $http.get(url)
                .then(getObjectsForCopyComplete)
                .catch(getObjectsForCopyFailed);

            function getObjectsForCopyComplete(response){
                return BlakeObject.create(response.data.results);
            }

            function getObjectsForCopyFailed(error){
                $log.error('XHR Failed for getObjectsForCopy.\n' + angular.toJson(error.data, true));
            }

        };

        blakeData.getWork = function (workId) {
            var url = directoryPrefix + '/api/work/' + workId;

            $log.info('getting work');

            return $http.get(url)
                .then(getWorkComplete)
                .catch(getWorkFailed);

            function getWorkComplete(response){
                return BlakeWork.create(response.data);
            }

            function getWorkFailed(error){
                $log.error('XHR Failed for getWork.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.getWorks = function () {
            var url = directoryPrefix + '/api/work/';

            $log.info('getting works: multi');

            return $http.get(url)
                .then(getWorksComplete)
                .catch(getWorksFailed);

            function getWorksComplete(response){
                return BlakeWork.create(response.data.results);
            }

            function getWorksFailed(error){
                $log.error('XHR Failed for getWorks: multi.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.getCopiesForWork = function (workId) {
            var url = directoryPrefix + '/api/work/' + workId + '/copies';

            $log.info('getting copies in work');

            return $http.get(url)
                .then(getCopiesForWorkComplete)
                .catch(getCopiesForWorkFailed);

            function getCopiesForWorkComplete(response){
                return BlakeCopy.create(response.data.results);
            }

            function getCopiesForWorkFailed(error){
                $log.error('XHR Failed for getCopies: multi.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.getFeaturedWorks = function () {
            var url = directoryPrefix + '/api/featured_work/';

            $log.info('getting featured works');

            return $http.get(url)
                .then(getFeaturedWorksComplete)
                .catch(getFeaturedWorksFailed);

            function getFeaturedWorksComplete(response){
                return BlakeWork.create(response.data.results);
            }

            function getFeaturedWorksFailed(error){
                $log.error('XHR Failed for getWorks: multi.\n' + angular.toJson(error.data, true));
            }

        };

        blakeData.setSelectedWork = function (workId) {
            return $q.all([
                blakeData.getWork(workId),
                blakeData.getCopiesForWork(workId)
            ]).then(function(data){
                blakeData.work = data[0];
                blakeData.workCopies = data[1];
                if(blakeData.work.virtual == true){
                    return blakeData.getObjectsForCopy(blakeData.workCopies[0].bad_id).then(function(data){
                        if(blakeData.work.bad_id == 'letters'){
                            blakeData.workCopies = blakeData.multiObjectGroup(data);
                        } else {
                            blakeData.workCopies = blakeData.numberVirtualWorkObjects(data);
                        }
                    });
                }
            });
        };

        blakeData.setWorkNoCopies = function (workId) {
            return blakeData.getWork(workId).then(function (data) {
                blakeData.work = data;
            });
        };


        blakeData.setSelectedCopy = function (copyId, descId) {

            var workBadMatch = copyId.indexOf('.'),
                workId = workBadMatch > 0 ? copyId.substring(0,workBadMatch) : copyId;

            return $q.all([
                blakeData.getCopy(copyId),
                blakeData.getObjectsForCopy(copyId),
                blakeData.getWork(workId)
            ]).then(function (data) {
                blakeData.copy = data[0];
                blakeData.copyObjects = data[1];
                blakeData.work = data[2];

                //Programatically order objects if "copy" is a virtual group, then replace number in full object id
                if (blakeData.work.virtual == true) {
                    blakeData.copyObjects = blakeData.numberVirtualWorkObjects(blakeData.copyObjects);
                }

                //deal with multi object groups
                if(blakeData.work.bad_id == 'letters'){
                    blakeData.multiObjectGroup(blakeData.copyObjects);
                }

                //Set the selected object
                if (descId) {
                    blakeData.copyObjects.forEach(function (obj) {
                        if (obj.desc_id == descId) {
                            return (blakeData.setFromSameX(obj)).then(function(){
                                blakeData.object = obj;
                            })
                        }
                    })
                } else {
                    blakeData.changeObject(blakeData.copyObjects[0]);
                }

            })

        };

        blakeData.numberVirtualWorkObjects = function(objects){
            var inc = 1;
            objects.forEach(function (obj) {
                //obj.object_number = inc;
                obj.full_object_id  = obj.title + ', Object '+inc+ obj.full_object_id.replace(/object [\d]+/g,'');
                inc++;
            });
            return objects;
        }

        // TODO: Each object group should be programmatically synonymous as a copy...should probably revisit this
        // IF we can get the service working correctly, we could fake the selected copy?
        blakeData.multiObjectGroup = function(objects){
            var copyOfObjects = angular.copy(objects);
            if(angular.isArray(objects)){
                var objectGroupArray = [];

                //First load all associations into an objectsInGroup array on the copy
                angular.forEach(copyOfObjects, function(cObject){
                    cObject.objectsInGroup = [];
                    angular.forEach(objects, function(obj){
                        if(obj.object_group == cObject.object_group){
                            cObject.objectsInGroup.push(obj);
                        }
                    })
                });

                angular.forEach(objects,function(obj){
                    obj.objectsInGroup = [];
                    if(obj.object_number == 1){
                        //probably don't need to push the entire object
                        objectGroupArray.push(obj);
                    }
                    angular.forEach(copyOfObjects, function(cObject){
                        if(obj.object_group == cObject.object_group){
                            obj.objectsInGroup.push(cObject);
                        }
                    })
                });

            }
            return objectGroupArray;
        }


        blakeData.setSelectedObject = function (descId) {
            return blakeData.getObject(descId).then(function (obj) {
                blakeData.changeObject(obj);
            })
        };

        blakeData.setFromSameX = function(object){

            if(angular.isDefined(object.matrix)){
                return $q.all();
            }

            object.matrix = {};
            object.sequence = {};
            object.motif = {};

            return $q.all([
                blakeData.getObjectsFromSameMatrix(object.desc_id),
                blakeData.getObjectsFromSameProductionSequence(object.desc_id),
                blakeData.getObjectsWithSameMotif(object.desc_id)
            ]).then(function (data) {
                object.matrix = BlakeObject.create(data[0]);
                object.sequence = BlakeObject.create(data[1]);
                object.motif = BlakeObject.create(data[2]);

            });
        }

        blakeData.changeObject = function(object){
            return blakeData.setFromSameX(object).then(function(){
                blakeData.object = object;
                $location.search('descId',blakeData.object.desc_id);
            });
        }

        blakeData.changeCopy = function(copyId,descId){
            return blakeData.setSelectedCopy(copyId,descId).then(function(){
                $location.path('/blake/copy/'+copyId,false);
                $location.search('descId',descId);
            });
        }

        return blakeData;
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

    // TODO: resize directive should not need to broadcast if the factory is properly formatted
    .factory('WindowSize', ['$window', function ($window) {
        var windowSize = {},
            w = angular.element($window);

        windowSize.height = w.height();
        windowSize.width = w.width();

        return windowSize;
    }])

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

        imageManipulation.reset = function(){
            imageManipulation.transform = {
                'rotate':0,
                'scale':1,
                'style': {}
            }
        }

        return imageManipulation;
    })

    .factory('CompareObjectsFactory', function(){

        var cof = this;

        cof.comparisonObjects = [];
        cof.main = {};
        cof.comparisonType = '';

        cof.setMainObject = function(obj){
            cof.main = obj;
            if(!cof.isComparisonObject(obj)){
                cof.comparisonObjects.unshift(obj);
            }
        };

        cof.isMain = function(obj){
            if(obj.object_id == cof.main.object_id){
                return true;
            }
            return false;
        }

        cof.addComparisonObject = function (obj) {
            if (!cof.isComparisonObject(obj)) {
                cof.comparisonObjects.push(obj);
            }
        };

        cof.selectAll = function (objects) {
            cof.comparisonObjects = angular.copy(objects);
            cof.comparisonObjects.unshift(cof.main);
        };

        cof.removeComparisonObject = function (obj) {
            var i;
            for (i = cof.comparisonObjects.length; i--;) {
                if (cof.comparisonObjects[i].object_id == obj.object_id) {
                    cof.comparisonObjects.splice(i, 1);
                    break;
                }
            }
        };

        cof.clearComparisonObjects = function () {
            cof.comparisonObjects = [];
            cof.comparisonObjects.unshift(cof.main);
        };

        cof.isComparisonObject = function (obj,type) {
            if(angular.isDefined(type)){
                if(type != cof.comparisonType){
                    return false;
                }
            }
            var i;
            for (i = cof.comparisonObjects.length; i--;) {
                if (cof.comparisonObjects[i].object_id == obj.object_id) {
                    return true;
                }
            }
            return false;
        };

        cof.checkCompareType = function(type){
            if(cof.comparisonType != type && cof.comparisonType != ''){
                cof.clearComparisonObjects();
            }
            cof.comparisonType = type;
        };

        cof.hasObjects = function(){
            if (angular.isDefined(cof.comparisonObjects)) {
                return cof.comparisonObjects.length > 0 ? true : false;
            }
            return false;
        };

        return cof;
    })

    /*.factory('SearchConfigFactory', function(){

        var scf = this;

        scf.scope = true;
        scf.type = true;

        scf.config = {
            useCompDate: true,
            searchTitle: false,
            searchText: false,
            searchWorkInformation: false,
            searchCopyInformation: false,
            searchImageKeywords: false,
            searchNotes: false,
            searchImageDescriptions: false,
            searchIlluminatedBooks: false,
            searchCommercialBookIllustrations: false,
            searchSeparatePrints: false,
            searchDrawingsPaintings: false,
            searchManuscripts: false,
            searchRelatedMaterials: false,
            minDate: 1772,
            maxDate: 1827
        };
        scf.getConfig = function(){
            if(scf.scope){
                scf.config.searchTitle
            }
        }

        return scf;


    }*/


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
    .directive('autoHeight', ['WindowSize', '$rootScope', function (WindowSize) {
        var link = function (scope, element, attrs) {

            scope.setStyles = function (windowSize) {
                if(WindowSize.width <= scope.breakpoint){
                    element.height('auto');
                } else {
                    var newHeight = (windowSize.height - scope.adjust);
                    if(scope.divide){
                        newHeight = newHeight / scope.divide;
                    }
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
                'adjust': '@adjust',
                'breakpoint': '@breakpoint',
                'divide': '@divide'
            }
        };
    }])

    .directive('autoWidth', ['WindowSize', '$rootScope', function (WindowSize) {
        var link = function (scope, element, attrs) {

            scope.setStyles = function (windowSize) {
                if(WindowSize.width <= scope.breakpoint){
                    element.width('auto');
                } else {
                    var newWidth = (windowSize.width - scope.adjust);
                    if(scope.percent){
                        newWidth = newWidth * scope.percent;
                    }
                    if(scope.divide){
                        newWidth = newWidth / scope.divide;
                    }
                    element.width(newWidth);
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
                'adjust': '@adjust',
                'breakpoint': '@breakpoint',
                'divide': '@divide',
                'percent': '@percent'
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
    //TODO make this a true scroll to element, rather than simple offset of current element
    .directive('scrollToElement',['$timeout',function($timeout){
        var link = function(scope,element,attr) {
            element.on('click',function(){
                $timeout(function () {
                    var elementOffset = attr.scrollToElement ? $(attr.scrollToElement).offset() : element.offset(),
                        offset = scope.offset ? parseInt(scope.offset) : 0;
                    $('html, body').animate({scrollTop: (elementOffset.top - offset)}, 'slow');
                }, 300);
            })
        }
        return{
            restrict: 'A',
            scope:{
                offset: '@offset'
            },
            link: link,
        }
    }])
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
                originalHeight = 0,
                originalWidth = 0;

            image.on('load',function(){
                height = image.height();
                width = image.width();
                originalHeight = container.height();
                originalWidth = element.width();
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

                if(height > width && $rootScope.view.mode == 'compare'){
                    if((imageManipulation.transform.rotate % 180) != 0){
                        element.width(height).css({'text-align':'center'});
                    } else {
                        element.width(originalWidth);
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
                descId: '@descId'
            },
            link:link
        }
    })
    
    .directive('blakeMenu', function($rootScope){
        return {
            restrict: 'A',
            constoller: function($scope,$rootScope){
                $scope.worksNavState = $rootScope.worksNavState;
            },
            /*link: function(scope,el,attr){
                el.on('click',function(){
                    console.log('menu clicked');
                    el.toggleClass('menu-open').toggleClass('menu-closed');
                    scope.worksNavState = !scope.worksNavState;
                })
            }*/
        }
    })

    .directive('showMe',function($window){
        return{
            restrict: 'A',
            link: function(scope,ele,attr){
                ele.on('click',function(){
                    $window.open('/blake/new-window/'+attr.showMe+'/'+scope.object.copy_bad_id+'?descId='+scope.object.desc_id, '_blank','width=800, height=600');
                })
            },
            scope:{
                object: '='
            }
        }
    })

    .filter('highlight',function($sce){
        return function(text,phrase) {
            if (!angular.isDefined(text) || !angular.isDefined(phrase)) {
                return $sce.trustAsHtml(text);
            }

            if (phrase.startsWith('"') && phrase.endsWith('"')) {
                phrase = phrase.replace(/"/g, '');
                console.log(phrase);
                text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
                return $sce.trustAsHtml(text);
            }

            if (phrase.indexOf(' ')) {
                phraseArray = phrase.split(' ');
                angular.forEach(phraseArray, function (ph) {
                    text = text.replace(new RegExp('(\\b' + ph + '\\b)', 'gi'), '<span class="highlighted">$1</span>');
                });
                return $sce.trustAsHtml(text);

            }

            text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');

            return $sce.trustAsHtml(text);
        }

    })


    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when(directoryPrefix + '/', {
            templateUrl: directoryPrefix + '/static/controllers/home/home.html',
            controller: "HomeController",
            controllerAs: 'home'
        });
        $routeProvider.when(directoryPrefix + '/staticpage/:initialPage', {
            templateUrl: directoryPrefix + '/static/controllers/staticpage/staticpage.html',
            controller: "StaticpageController",
            controllerAs: 'staticpage'
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
directoryPrefix = '/blake';

angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q',
        function ($scope, $timeout, $transition, $q) {
        }]).directive('carousel', [function () {
    return {}
}]);


angular.module('blake', ['ngRoute', 'ngSanitize', 'ui-rangeSlider', 'ui.bootstrap', 'ng-sortable', 'FBAngular', 'ngAnimate', 'ngStorage','ngCookies','ngTouch','markdown'])

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
                // obj.characteristics = angular.fromJson(config.characteristics);
                obj.text = angular.fromJson(config.text);
                obj.notes = angular.fromJson(config.notes);
                //obj.lines = [];
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
                function eachRecursive(objtext, altspelling){
                    for (var k in objtext) {
                        if (typeof objtext[k] == "object" && objtext[k] !== null){
                            if(k == 'choice'){
                                if(angular.isArray(objtext[k])){
                                    angular.forEach(objtext[k], function(spellings){
                                        if(angular.isDefined(spellings['orig']) && angular.isDefined(spellings['orig']['#text'])) {
                                            var orig = spellings['orig']['#text'];
                                            var reg = '';

                                            // Check the reg attribute
                                            if (angular.isDefined(spellings['reg'])){
                                                reg = spellings['reg'];
                                            }

                                            // Check the corr attribute
                                            if (angular.isDefined(spellings['corr'])){
                                                reg = spellings['corr'];
                                            }
                                            if(angular.isArray(reg)){
                                                angular.forEach(reg, function(v){
                                                    var alt = {reg: v['#text'].toLowerCase(), orig: orig.toLowerCase()};
                                                    altspelling.push(alt);
                                                });
                                            } else {
                                                var alt = {reg: reg['#text'].toLowerCase(), orig: orig.toLowerCase()};
                                                altspelling.push(alt);
                                            }

                                        }
                                    });
                                } else {
                                    if(angular.isDefined(objtext[k]['orig']) && angular.isDefined(objtext[k]['orig']['#text'])){
                                        var orig = objtext[k]['orig']['#text'];
                                        var reg = '';

                                        // Check the reg attribute
                                        if (angular.isDefined(objtext[k]['reg'])){
                                            reg = objtext[k]['reg'];
                                        }

                                        // Check the corr attribute
                                        if (angular.isDefined(objtext[k]['corr'])){
                                            reg = objtext[k]['corr'];
                                        }

                                        if(angular.isArray(reg)){
                                            angular.forEach(reg, function(v){
                                                var alt = {reg: v['#text'].toLowerCase(), orig: orig.toLowerCase()};
                                                altspelling.push(alt);
                                            });
                                        } else {
                                            var alt = {reg: reg['#text'].toLowerCase(), orig: orig.toLowerCase()};
                                            altspelling.push(alt);
                                        }
                                    }
                                }
                            } else {
                                eachRecursive(objtext[k],altspelling);
                            }
                        }
                    }
                }
                obj.alt_spellings = [];
                eachRecursive(obj.text,obj.alt_spellings);
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
            //FIXME:: Figure out why the Laocoon work's title isn't getting encoded in utf8
            if(copy.title == "LaocoÃ¶n"){
                copy.title = "Laocoön";
            }
            switch (copy.archive_copy_id) {
                case 'biblicalwc':
                case 'biblicaltemperas':
                case 'but543':
                case 'letters':
                case 'gravepd':
                case 'pid':
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

            // Get the medium and probable phrase
            switch(work.medium) {
                case "illbk":
                    work.medium_pretty = 'Illuminated Books';
                    work.probable = 'printing';
                    break;
                case "comb":
                case "comdes":
                case "comeng":
                    work.medium_pretty = 'Commercial Book Illustrations';
                    work.probable = 'printing';
                    break;
                case "spb":
                case "spdes":
                case "speng":
                case "cprint":
                    work.medium_pretty = 'Prints';
                    work.probable = 'printing';
                    break;
                case "mono":
                case "paint":
                case "pen":
                case "penink":
                case "penc":
                case "wc":
                    work.medium_pretty = 'Drawings and Paintings';
                    work.probable = 'composition';
                    break;
                case "ms":
                case "ltr":
                case "te":
                    work.medium_pretty = 'Manuscripts and Typographic Works';
                    work.probable = 'composition';
                    break;
                case "exhibit":
                    work.medium_pretty = "Archive Exhibits";
                    work.probable = 'composition';
                    break;
                default:
                    return false;
            }

            //Create an alternative work title for virtual works
            work.menuTitle = work.title;
            //FIXME:: Figure out why the Laocoon work's title isn't getting encoded in utf8
            if(work.title == "LaocoÃ¶n"){
                work.title = "Laocoön";
                work.menuTitle = "Laocoön";
            }
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
                case 'pid':
                    work.title = 'Pen and Ink Drawings';
                    work.virtual = true;
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

            angular.forEach(work.related_works, function(v){
                v.displayTitle = v.title.text != '' ? v.title.text : false;
                if (v.title.link){
                    switch(v.title.type){
                        case 'work':
                            v.type = 'work';
                            v.link = "/blake/work/" + v.title.link;
                            break;
                        case 'copy':
                            v.type = 'copy';
                            v.link = "/blake/copy/" + v.title.link;
                            break;
                        case 'object':
                            v.type = 'object';
                            v.link = v.title.link;
                            break;
                        default:
                            v.type = "none";
                            v.link = false;
                    }
                } else {
                    if(v.title.text.substring(0,4).toLowerCase() == 'copy' || v.info.substring(0,4).toLowerCase() == 'copy'){
                        v.type = "copy";
                    } else {
                        v.type = "none";
                    }
                    v.link = false;
                }
            });

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

    .factory("BlakeDataService", ['$rootScope','$log', '$http', '$q', '$location', 'BlakeWork', 'BlakeCopy', 'BlakeObject', 'BlakeFeaturedWork', function ($rootScope, $log, $http, $q, $location, BlakeWork, BlakeCopy, BlakeObject, BlakeFeaturedWork) {
        /**
         * For the time being, all data accessor functions should be placed here.  This service should mirror the API
         * of the back-end BlakeDataService.
         */

        var blakeData = {
            featured: {},
            work: {},
            workCopies: [],
            copy: {},
            copyObjects: [],
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

        blakeData.getSupplementalObjects = function (descId) {
            var url = directoryPrefix + '/api/object/' + descId + '/supplemental_objects';

            $log.info('getting supplemental objects');

            return $http.get(url)
                .then(getSupplementalObjectsComplete)
                .catch(getSupplementalObjectsFailed);

            function getSupplementalObjectsComplete(response){
                return BlakeObject.create(response.data.results);
            }

            function getSupplementalObjectsFailed(error){
                $log.error('XHR Failed for getSupplementalObjects.\n' + angular.toJson(error.data, true));
            }
        };

        blakeData.getTextuallyReferencedMaterial = function (descId) {
            var url = directoryPrefix + '/api/object/' + descId + '/textually_referenced_materials';

            $log.info('getting objects with textual references');

            return $http.get(url)
                .then(getTextuallyReferencedMaterialComplete)
                .catch(getTextuallyReferencedMaterialsFailed);

            function getTextuallyReferencedMaterialComplete(response) {
                return {
                    objects: response.data.objects.length ? BlakeObject.create(response.data.objects) : [],
                    copies: response.data.copies.length ? BlakeObject.create(response.data.copies) : [],
                    works: response.data.works.length ? BlakeObject.create(response.data.works) : []
                }
            }

            function getTextuallyReferencedMaterialsFailed(error) {
                $log.error('XHR failed for getTextaullyReferencedMaterial.\n' + angular.toJson(error.data, true))
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
                $log.error('Reuesting: ' + url);
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
                //return BlakeWork.create(response.data.results);
                $log.info(response.data.results);
                return response.data.results;
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
                console.log(data[0]);
                blakeData.workCopies = data[1];
                blakeData.setRelatedWorkObjectLinks();
                if(blakeData.work.virtual == true){
                    return blakeData.getObjectsForCopy(blakeData.workCopies[0].bad_id).then(function(data){

                        blakeData.workCopies = data;

                        if(blakeData.work.bad_id == 'letters'){

                            var objectGroup = {},
                                objectArray = [];

                            angular.forEach(blakeData.workCopies, function(obj){
                                if(!angular.isDefined(objectGroup[obj.object_group])) {
                                    objectGroup[obj.object_group] = obj;
                                }
                            });

                            angular.forEach(objectGroup, function(v){
                               objectArray.push(v);
                            });

                            blakeData.workCopies = objectArray;

                        } else {
                            blakeData.workCopies = blakeData.numberVirtualWorkObjects(blakeData.workCopies);
                        }
                    });
                }
            });
        };

        blakeData.setRelatedWorkObjectLinks = function(){
            if(blakeData.related_works){
                var related_work_objects = blakeData.work.related_works.filter(function(obj) {
                    return obj.type == 'object' && obj.link;
                });

                if(related_work_objects.length > 0){
                    var object_ids = related_work_objects.map(function(obj) { return obj.link; });
                    return blakeData.getObjects(object_ids).then(function(data){
                        angular.forEach(blakeData.work.related_works, function(obj,key){
                            if(obj.type == 'object' && obj.link){
                                var matchingObject = data.filter(function(o){return o.desc_id == obj.link});
                                blakeData.work.related_works[key].link = '/blake/copy/'+matchingObject[0].copy_bad_id+'?descId='+obj.link;
                            }
                        });
                    });
                }
            }
        }

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
                blakeData.setSelectedWork(workId)
                //blakeData.getWork(workId)
            ]).then(function (data) {
                blakeData.copy = data[0];
                blakeData.copyObjects = data[1];

                console.log('selected Work');
                console.log(blakeData.work);
                console.log('selected Copy');
                console.log(blakeData.copy);
                console.log('selected Copy Objects');
                console.log(blakeData.copyObjects);

                //Programatically order objects if "copy" is a virtual group, then replace number in full object id
                if (blakeData.work.virtual == true && blakeData.work.bad_id != 'letters') {
                    blakeData.copyObjects = blakeData.numberVirtualWorkObjects(blakeData.copyObjects);
                }
                //deal with multi object groups
                /*if(blakeData.work.bad_id == 'letters'){
                    blakeData.copy.objectGroups = blakeData.multiObjectGroupObjects(blakeData.copyObjects);
                }*/


                //Set the selected object
                if (descId) {

                    blakeData.getObject(descId).then(function(data){
                        blakeData.changeObject(data);
                    });

                } else {
                    blakeData.changeObject(blakeData.copyObjects[0]);
                }

            })


        };

        blakeData.numberVirtualWorkObjects = function(objects){
            var inc = 1;
            objects.forEach(function (obj) {
                if(!obj.supplemental){
                    //obj.object_number = inc;
                    obj.full_object_id  = 'Object '+inc+ ' '+obj.full_object_id.replace(/object [\d]+/gi,'');
                    inc++;
                }
            });
            return objects;
        }

        /*blakeData.multiObjectGroupObjects = function(objects){
            if(angular.isArray(objects)) {
                var objectGroup = {};

                angular.forEach(objects, function (obj) {
                    if(angular.isDefined(objectGroup[obj.object_group])){
                        objectGroup[obj.object_group].push(obj);
                    } else {
                        objectGroup[obj.object_group] = [];
                        objectGroup[obj.object_group].push(obj);
                    }
                });

                return objectGroup;
            }
        }*/


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
            object.supplemental_objects = {};

            var desc_id_for_supp_query = object.supplemental ? object.supplemental : object.desc_id;

            return $q.all([
                blakeData.getObjectsFromSameMatrix(object.desc_id),
                blakeData.getObjectsFromSameProductionSequence(object.desc_id),
                blakeData.getObjectsWithSameMotif(object.desc_id),
                blakeData.getSupplementalObjects(desc_id_for_supp_query),
                blakeData.getTextuallyReferencedMaterial(object.desc_id)
            ]).then(function (data) {
                object.matrix = BlakeObject.create(data[0]);
                object.sequence = BlakeObject.create(data[1]);
                object.motif = BlakeObject.create(data[2]);
                object.text_ref = data[4];
                object.supplemental_objects = BlakeObject.create(data[3]);
            });
        }

        blakeData.changeObject = function(object){
            return blakeData.setFromSameX(object).then(function(){
                blakeData.object = object;
                console.log('object');
                console.log(blakeData.object);
                if(!object.supplemental){
                    $location.search('descId',blakeData.object.desc_id);
                    var target = '#' + blakeData.object.desc_id.replace(/\./g,'-');
                    $rootScope.$broadcast('viewSubMenu::readingMode',{'target': target});
                }
                $rootScope.$broadcast('change::selectedObject')
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
            'style': {},
            'orientation':1
        }

        imageManipulation.rotate = function(){
            imageManipulation.transform.rotate = imageManipulation.transform.rotate + 90;

            imageManipulation.transform.orientation += 1;
            if(imageManipulation.transform.orientation == 5){
                imageManipulation.transform.orientation = 1;
            }
        }

        imageManipulation.reset = function(){
            imageManipulation.transform = {
                'rotate':0,
                'scale':1,
                'style': {},
                'orientation':1
            }
        }

        return imageManipulation;
    })

    .factory('CompareObjectsFactory', function(){

        var cof = this;

        cof.main = {};
        cof.comparisonType = '';
        cof.comparisonObjects = [];

        cof.setMainObject = function(obj){
            cof.main = obj;
            if(!cof.isComparisonObject(obj)){
                cof.comparisonObjects.unshift(obj);
            }
        };

        cof.resetComparisonObjects = function(){
            cof.main = {};
            cof.clearComparisonObjects();
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
            if(angular.isDefined(cof.main.object_id)){
                cof.comparisonObjects.unshift(cof.main);
            }
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
            cof.comparisonType = '';
            if(angular.isDefined(cof.main.object_id)){
                cof.comparisonObjects.unshift(cof.main);
            }
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
                if(windowSize.width < scope.breakpoint){
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

      .directive('affix',function($window){
          var link = function(scope,element,attr){
              var w = angular.element($window),
                elementOffsetTop = element[0].getBoundingClientRect().top,
                offsetTop = angular.isDefined(attr.offsetTop) ? attr.offsetTop : 0,
                offsetStart = angular.isDefined(attr.offsetStart) ? parseInt(attr.offsetStart) : 0,
                offsetBottom = angular.isDefined(attr.offsetBottom) ? parseInt(attr.offsetBottom) : 0,
                minWidth = angular.isDefined(attr.minWidth) ? parseInt(attr.minWidth) : 0;

              function affixElement() {

                  var elementHeight = angular.element(element).height();
                  var pageHeight = document.body.scrollHeight;
                  var doNotPass =  pageHeight - offsetBottom;


                  if (offsetBottom !== 0 && $window.pageYOffset + elementHeight >= doNotPass && pageHeight - offsetBottom > elementHeight){
                      element.css('position', 'absolute');
                      element.css('top','');
                      element.css('bottom','50px');
                  } else if ($window.pageYOffset > elementOffsetTop + offsetStart && pageHeight - offsetBottom > elementHeight) {
                      element.css('position', 'fixed');
                      element.css('top', offsetTop+'px');
                      element.css('bottom','');
                  } else {
                      element.css('position', '');
                      element.css('top', '');
                      element.css('bottom','');
                      width = element[0].clientWidth;
                  }
              }

              function resetWidth() {
                  if ($window.pageYOffset > (elementOffsetTop + offsetStart)) {
                      element.css('position', '');
                      element.css('top', '');
                      element.css('bottom','');
                      //element.css('width','100%');
                      //width = element[0].clientWidth;
                      affixElement();
                  }
              }

              scope.$on('resize::resize',function(){
                  resetWidth();
              });

              w.bind('scroll', affixElement);
          }
          return {
              restrict: 'A',
              link: link
          };
      })

    .directive('autoWidth', ['WindowSize', '$rootScope', function (WindowSize) {
        var link = function (scope, element, attrs) {

            scope.setStyles = function (windowSize) {
                if(windowSize.width < scope.breakpoint){
                    element.width('');
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
    .directive('leftOnBroadcast',function($timeout){
        var link = function(scope,element,attr) {
            if(attr.leftOnBroadcast){
                scope.$on(attr.leftOnBroadcast,function($event,$data){
                    if($data.target){
                        $timeout(function(){
                            var offset = $(element).find($data.target)[0].offsetLeft;
                            $(element).animate({scrollLeft: offset}, 'fast');
                        },300);

                    }
                });
            }
        }
        return{
            restrict: 'A',
            link: link
        }
    })
    .directive('scrollToTop',function(){
        var link = function(scope,element,attr) {
            element.on('click',function(){
                $('html, body').animate({scrollTop: 0}, 'fast');
                $("#Overlay").animate({scrollTop: 0}, 'fast');
            })
        }
        return{
            restrict: 'A',
            link: link
        }
    })

    .directive('toTopOnBroadcast',function(){
      var link = function(scope,element,attr) {
          if(attr.toTopOnBroadcast){
              scope.$on(attr.toTopOnBroadcast,function(){
                  if(attr.target){
                      $(element).find(attr.target).each(function(k,v){
                          $(v).animate({scrollTop: 0}, 'fast');
                      });
                  } else {
                    $(element).animate({scrollTop: 0}, 'fast');
                  }
              })
          }
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
                parentHeight = 0;

            image.on('load',function(){
                height = image[0].naturalHeight;
                width = image[0].naturalWidth;
                parentHeight = container.height();
                if(width > height){
                    var newHeight = Math.round((height * parentHeight / width));
                    var margin = Math.round(((parentHeight - newHeight) / 2));
                    image.css({'height':'auto','width':parentHeight+'px','margin-top':margin+'px'});
                } else {
                    image.css({'height':'100%','width':'auto','margin-top':'0'});
                }
            });

            scope.transformRotate = function(){
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


    /*
    Code taken from:
     http://cssdeck.com/labs/magnifying-glass-plugin-with-jquery-and-css3

     Changed slightly to work in angular
     */
    .directive('magnifyImage',function($interval,$window,$rootScope,imageManipulation,BlakeDataService){
        var link = function(scope,ele,attr,vm){
            if($rootScope.zoom){

            }
            var native_width = 0;
            var native_height = 0;
            var mouse = {x: 0, y: 0};
            var magnify;
            var cur_img;

            var ui = {
                magniflier: ele
            };

            // Add the magnifying glass
            if (ui.magniflier.length) {
                var div = document.createElement('div');
                div.setAttribute('class', 'glass');
                ui.glass = angular.element(div);

                angular.element(document.body).append(div);
            }


            var mouseMove = function(e) {

                // Container offset relative to document
                var magnify_offset = cur_img.offset();

                // Mouse position relative to container
                // pageX/pageY - container's offsetLeft/offetTop
                if((imageManipulation.transform.rotate % 180) != 0){
                    var checkHeight = cur_img.width();
                    var checkWidth = cur_img.height();
                } else {
                    var checkHeight = cur_img.height();
                    var checkWidth = cur_img.width();
                }
                mouse.x = e.pageX - magnify_offset.left;
                mouse.y = e.pageY - magnify_offset.top;


                // The Magnifying glass should only show up when the mouse is inside
                // It is important to note that attaching mouseout and then hiding
                // the glass wont work cuz mouse will never be out due to the glass
                // being inside the parent and having a higher z-index (positioned above)
                if (mouse.x < checkWidth && mouse.y < checkHeight && mouse.x > 0 && mouse.y > 0) {
                    magnify(e);
                } else {
                    ui.glass.removeClass('glass-on');
                }

                return;
            };

            var magnify = function(e) {

                // The background position of div.glass will be
                // changed according to the position
                // of the mouse over the img.magniflier
                //
                // So we will get the ratio of the pixel
                // under the mouse with respect
                // to the image and use that to position the
                // large image inside the magnifying glass

                if(imageManipulation.transform.orientation == 4){
                    newY = cur_img.width() - mouse.y;
                    var rx = Math.round(newY/cur_img.width()*native_width - ui.glass.width()/2)*-1;
                    var ry = Math.round(mouse.x/cur_img.height()*native_height - ui.glass.height()/2)*-1;
                }

                if (imageManipulation.transform.orientation == 3){
                    newY = cur_img.height() - mouse.y;
                    newX = cur_img.width() - mouse.x;
                    var rx = Math.round(newX/cur_img.width()*native_width - ui.glass.width()/2)*-1;
                    var ry = Math.round(newY/cur_img.height()*native_height - ui.glass.height()/2)*-1;
                }
                if (imageManipulation.transform.orientation == 2) {
                    newX = cur_img.height() - mouse.x;
                    var rx = Math.round(mouse.y / cur_img.width() * native_width - ui.glass.width() / 2) * -1;
                    var ry = Math.round(newX / cur_img.height() * native_height - ui.glass.height() / 2) * -1;
                }

                if (imageManipulation.transform.orientation == 1){
                    var rx = Math.round(mouse.x/cur_img.width()*native_width - ui.glass.width()/2)*-1;
                    var ry = Math.round(mouse.y/cur_img.height()*native_height - ui.glass.height()/2)*-1;

                }

                var bg_pos = rx + "px " + ry + "px";

                // Calculate pos for magnifying glass
                //
                // Easy Logic: Deduct half of width/height
                // from mouse pos.

                /*if((imageManipulation.transform.rotate % 180) != 0){
                    var glass_left = e.pageX - ui.glass.height() / 2;
                    var glass_top  = e.pageY - ui.glass.width() / 2;
                } else {
                    var glass_left = e.pageX - ui.glass.width() / 2;
                    var glass_top  = e.pageY - ui.glass.height() / 2;
                }*/
                var glass_left = e.pageX - ui.glass.width() / 2;
                var glass_top  = e.pageY - ui.glass.height() / 2;

                // Now, if you hover on the image, you should
                // see the magnifying glass in action
                ui.glass.css({
                    left: glass_left,
                    top: glass_top,
                    backgroundPosition: bg_pos
                });

                return;
            };

            ele.on('mousemove', function() {
                if($rootScope.zoom){

                    cur_img = angular.element(this);

                    var src = cur_img.attr('src');
                    src = src.replace('100','300');

                    if (src) {
                        ui.glass.css({
                            'background-image': 'url(' + src + ')',
                            'background-repeat': 'no-repeat'
                        });
                    }

                    // When the user hovers on the image, the script will first calculate
                    // the native dimensions if they don't exist. Only after the native dimensions
                    // are available, the script will show the zoomed version.
                    if (!cur_img.data('native_width')) {
                        // This will create a new image object with the same image as that in .small
                        // We cannot directly get the dimensions from .small because of the
                        // width specified to 200px in the html. To get the actual dimensions we have
                        // created this image object.
                        var image_object = new Image();

                        image_object.onload = function() {
                            // This code is wrapped in the .load function which is important.
                            // width and height of the object would return 0 if accessed before
                            // the image gets loaded.
                            native_width = image_object.width;
                            native_height = image_object.height;

                            cur_img.data('native_width', native_width);
                            cur_img.data('native_height', native_height);

                            ui.glass.addClass('glass-on');

                            mouseMove.apply(this, arguments);

                            ui.glass.on('mousemove', mouseMove);
                        };


                        image_object.src = src;

                        return;
                    } else {

                        native_width = cur_img.data('native_width');
                        native_height = cur_img.data('native_height');
                    }

                    ui.glass.addClass('glass-on');

                    mouseMove.apply(this, arguments);

                    ui.glass.on('mousemove', mouseMove);
                }
            });

            ui.glass.on('mouseout', function() {
                ui.glass.off('mousemove', mouseMove);
            });

            scope.$watch(function(){return imageManipulation.transform},function(){
                ui.glass.css(imageManipulation.transform.style);
            },true);

            scope.$watch(function(){return $rootScope.zoom},function(){
                if(!$rootScope.zoom){
                    ui.glass.removeClass('glass-on');
                }
            },true);

            scope.$watch(function(){return BlakeDataService.object},function(){
                if(angular.isDefined(cur_img)){
                    cur_img.data('native_width', false);
                    cur_img.data('native_height', false);
                }
            },true);

        }

        return{
            restrict: 'A',
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
                    $window.open('/blake/new-window/'+attr.showMe+'/'+scope.copyBad+'?descId='+scope.object.desc_id, '_blank','width=800, height=600');
                })
            },
            scope:{
                object: '=',
                copyBad: '@'
            }
        }
    })

    .filter('highlight',function($sce){

        var vm = this;

        vm.runReplace = function(phrase,text){
            if (phrase !== ''){
                if (phrase.startsWith('"') && phrase.endsWith('"')) {
                    phrase = phrase.replace(/"/g, '');
                    text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
                    return text;
                }

                if (phrase.indexOf(' ')) {
                    phraseArray = phrase.split(' ');
                    angular.forEach(phraseArray, function (ph) {
                        text = text.replace(new RegExp('(\\b' + ph + '\\b)', 'gi'), '<span class="highlighted">$1</span>');
                    });
                    return text;

                }

                text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
            }

            return text;
        }

        return function(text,phrase,alt) {
            if (!angular.isDefined(text) || !angular.isDefined(phrase)) {
                return $sce.trustAsHtml(text);
            }

            if(angular.isDefined(alt) && alt.length > 0){
                angular.forEach(alt, function(spelling){
                    var newPhrase = phrase.toLowerCase();
                    if(newPhrase.indexOf(spelling.reg) > -1){
                        newPhrase = newPhrase.replace(spelling.reg,spelling.orig);
                        text = vm.runReplace(newPhrase,text);
                    }
                });
            }

            return $sce.trustAsHtml(vm.runReplace(phrase,text));
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
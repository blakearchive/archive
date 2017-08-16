angular.module("blake").factory("BlakeDataService", function ($rootScope, $log, $http, $q, $location, BlakeObject, BlakeCopy, BlakeWork, directoryPrefix) {
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

        //$log.info('query objects in solr');

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

        //$log.info('query copies in solr');

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

        //$log.info('query works in solr');

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

        //$log.info('getting object');

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

        //$log.info('getting objects: multi');

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

        //$log.info('getting objects w/ same motif');

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

        //$log.info('getting objects from same matrix');

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

    blakeData.getSameMatrixObjectFromOtherCopy = function (descId,badId) {
        var url = directoryPrefix + '/api/object/' + descId + '/' + badId;

        //$log.info('getting objects from same matrix');

        return $http.get(url)
            .then(getSameMatrixObjectFromOtherCopyComplete)
            .catch(getSameMatrixObjectFromOtherCopyFailed);

        function getSameMatrixObjectFromOtherCopyComplete(response){
            return BlakeObject.create(response.data);
        }

        function getSameMatrixObjectFromOtherCopyFailed(error){
            $log.error('XHR Failed for getSameMatrixObjectFromOtherCopy.\n' + angular.toJson(error.data, true));
        }
    };


    blakeData.getObjectsFromSameProductionSequence = function (descId) {
        var url = directoryPrefix + '/api/object/' + descId + '/objects_from_same_production_sequence';

        //$log.info('getting objects from same production sequence');

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

        //$log.info('getting supplemental objects');

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

        //$log.info('getting objects with textual references');

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

        //$log.info('getting copy');

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

        //$log.info('getting copies: multi');

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

        //$log.info('getting objects in copy');

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

        //$log.info('getting work');

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

        //$log.info('getting works: multi');

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

        //$log.info('getting copies in work');

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

        //$log.info('getting featured works');

        return $http.get(url)
            .then(getFeaturedWorksComplete)
            .catch(getFeaturedWorksFailed);

        function getFeaturedWorksComplete(response){
            //return BlakeWork.create(response.data.results);
            //$log.info(response.data.results);
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
            //console.log(data[0]);
            blakeData.workCopies = data[1];
            blakeData.setRelatedWorkObjectLinks();
            if(blakeData.work.virtual == true){
                return blakeData.getObjectsForCopy(blakeData.workCopies[0].bad_id).then(function(data){

                    blakeData.workCopies = data;

                    if(blakeData.work.bad_id == 'letters'){

                        var objectGroup = {},
                            objectArray = [];

                        blakeData.workCopies.forEach(obj =>{
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
                    blakeData.work.related_works.forEach((obj,key) => {
                        if(obj.type == 'object' && obj.link){
                            var matchingObject = data.filter(function(o){return o.desc_id == obj.link});
                            blakeData.work.related_works[key].link = '/copy/'+matchingObject[0].copy_bad_id+'?descId='+obj.link;
                        }
                    });
                });
            }
        }
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
            blakeData.setSelectedWork(workId)
            //blakeData.getWork(workId)
        ]).then(function (data) {
            blakeData.copy = data[0];
            blakeData.copyObjects = data[1];

            //console.log('selected Work');
            //console.log(blakeData.work);
            //console.log('selected Copy');
            //console.log(blakeData.copy);
            //console.log('selected Copy Objects');
            //console.log(blakeData.copyObjects);

            //Programatically order objects if "copy" is a virtual group, then replace number in full object id
            if (blakeData.work.virtual == true && blakeData.work.bad_id != 'letters') {
                blakeData.copyObjects = blakeData.numberVirtualWorkObjects(blakeData.copyObjects);
            }

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
    };

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
    };

    blakeData.changeObject = function(object){
        return blakeData.setFromSameX(object).then(function(){
            blakeData.object = object;
            //console.log('object');
            //console.log(blakeData.object);
            if(!object.supplemental){
                $location.search('descId',blakeData.object.desc_id);
                var target = '#' + blakeData.object.desc_id.replace(/\./g,'-');
                $rootScope.$broadcast('viewSubMenu::readingMode',{'target': target});
            }
            $rootScope.$broadcast('change::selectedObject')
        });
    };

    blakeData.changeCopy = function(copyId,descId){
        return blakeData.setSelectedCopy(copyId,descId).then(function(){
            $location.path('/copy/'+copyId,false);
            $location.search('descId',descId);
        });
    };

    return blakeData;
});
/**
 * Created by lukeluke on 1/25/16.
 */

(function () {

    /** @ngInject */
    var controller = function ($rootScope,$routeParams,$modal,$cookies,BlakeDataService) {

        var vm = this;
        vm.bds = BlakeDataService;

        $rootScope.showmePage = true;

        vm.what = $routeParams.what;

        BlakeDataService.setSelectedCopy($routeParams.copyId,$routeParams.descId);

        vm.getOvpTitle = function(){
            if(angular.isDefined(vm.bds.copy)){
                if(vm.bds.work.virtual == true){
                    if(vm.bds.copy.bad_id == 'letters'){
                        return vm.bds.object.object_group;
                    } else {
                        return vm.bds.work.title;
                    }
                } else {
                    var copyPhrase = vm.bds.copy.archive_copy_id == null ? '' : ', Copy '+vm.bds.copy.archive_copy_id;

                    if(vm.bds.copy.header){
                        copyPhrase = vm.bds.copy.header.filedesc.titlestmt.title['@reg']+copyPhrase
                    }

                    return copyPhrase;
                }
            }
        }

        vm.getPreviousObject = function(){

            var list = {};

            if(vm.bds.work.bad_id == 'letters'){
                list = vm.bds.copy.objectGroups[vm.bds.object.object_group];
            } else {
                list = [];
                angular.forEach(vm.bds.copyObjects,function(obj){
                    if(!obj.supplemental){
                        list.push(obj);
                    }
                })
            }

            var currObject = vm.bds.object;
            if(currObject.supplemental){
                list.forEach(function(object){
                    if(currObject.object_group == object.object_group){
                        currObject = object;
                    }
                });
            }

            if(list){
                for (var i = list.length; i--;) {
                    if (list[i].object_id == currObject.object_id) {
                        // Extra code here to make the list circular
                        if (i - 1 < 0) {
                            return list[list.length - 1];
                        } else {
                            return list[i - 1];
                        }
                    }
                }
            }
        }

        vm.getNextObject = function(){

            var list = {};

            if(vm.bds.work.bad_id == 'letters'){
                list = vm.bds.copy.objectGroups[vm.bds.object.object_group];
            } else {
                list = [];
                angular.forEach(vm.bds.copyObjects,function(obj){
                    if(!obj.supplemental){
                        list.push(obj);
                    }
                })
            }

            var currObject = vm.bds.object;
            if(currObject.supplemental){
                list.forEach(function(object){
                    if(currObject.object_group == object.object_group){
                        currObject = object;
                    }
                });
            }

            if(list){
                for (var i = list.length; i--;) {
                    if (list[i].object_id == currObject.object_id) {
                        // Extra code here to make the list circular
                        if (i + 1 >= list.length) {
                            return list[0];
                        } else {
                            return list[i + 1];
                        }
                    }
                }
            }

        };

        vm.changeObject = function(object){
            vm.bds.changeObject(object);
        }

        vm.trueSize = function(){
            if(angular.isDefined($cookies.getObject('clientPpi')) && angular.isDefined((vm.bds.copy))){
                var size = vm.bds.object.physical_description.objsize['#text'].split(' '),
                    clientPpi = $cookies.getObject('clientPpi'),
                    x = size[2],
                    y = size[0],
                    unit = size[3],
                    width = x / 2.54 * clientPpi.ppi,
                    height = y / 2.54 * clientPpi.ppi;
                //console.log('x='+x+'  y='+y+'  unit='+unit+'  ppi='+clientPpi.ppi);
                if(unit == 'mm.'){
                    width = width * 10;
                    height = height * 10;
                }

                 return {'height':height+'px','width':width+'px'}

            }
        }

        vm.clientPpiOpen = function(){
            var clientDpiModalInstance = $modal.open({
                template: '<client-ppi></client-ppi>',
                controller: 'ModalController',
                size: 'lg'
            });
        }

    };

    angular.module('blake').controller('ShowMeController', controller);

}());
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

        BlakeDataService.setSelectedCopy($routeParams.copyId,$routeParams.descId).then(function() {
            vm.init();
        });


        vm.init = function(){
            if(vm.bds.copyObjects.length > 1){
                vm.getPreviousNextObjects();
            }
        }

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

        vm.getPreviousNextObjects = function () {
            if (vm.bds.copyObjects && vm.bds.copyObjects.length) {
                for (var i = vm.bds.copyObjects.length; i--;) {
                    if (vm.bds.copyObjects[i].object_id == vm.bds.object.object_id) {
                        // Extra code here to make the list circular
                        if (i - 1 < 0) {
                            vm.previousObject = vm.bds.copyObjects[vm.bds.copyObjects.length - 1];
                        } else {
                            vm.previousObject = vm.bds.copyObjects[i - 1];
                        }
                        if (i + 1 >= vm.bds.copyObjects.length) {
                            vm.nextObject = vm.bds.copyObjects[0];
                        } else {
                            vm.nextObject = vm.bds.copyObjects[i + 1];
                        }
                        break;
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
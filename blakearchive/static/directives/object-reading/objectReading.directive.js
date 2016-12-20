(function(){

    /** @ngInject */
    var controller = function($rootScope,BlakeDataService){
        var vm = this;
        vm.bds = BlakeDataService;
        $rootScope.onWorkPage = false;
        $rootScope.view.scope = 'both';
        
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


        vm.changeObject = function(object){
            vm.bds.changeObject(object);
            $rootScope.view.mode = 'object';
            $rootScope.view.scope = 'image';
            $rootScope.persistentmode = 'gallery';
            $rootScope.states.activeItem = 'gallery';
        }

        vm.cssSafeId = function(string){
            return string.replace(/\./g,'-');
        }
    }


    var objectReading = function(){
        return {
            restrict: 'E',
            templateUrl: '/static/directives/object-reading/objectReading.html',
            controller: controller,
            controllerAs: 'read',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectReading", objectReading);

}());
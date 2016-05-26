(function(){

    /** @ngInject */
    var controller = function($sessionStorage,BlakeDataService){
        var vm = this;
        vm.$storage = $sessionStorage;
        vm.bds = BlakeDataService;
        
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

    }


    var objectReading = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/object-reading/objectReading.html',
            controller: controller,
            controllerAs: 'read',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectReading", objectReading);

}());
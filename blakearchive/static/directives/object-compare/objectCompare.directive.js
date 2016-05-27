(function(){


    /** @ngInject */
    var controller = function ($rootScope,BlakeDataService,CompareObjectsFactory) {

        var vm = this;
        vm.bds = BlakeDataService;
        vm.cof = CompareObjectsFactory;

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

        vm.changeObject = function(copyId,objectId){
            vm.bds.changeCopy(copyId,objectId);
        }

    }

    var link = function(scope,ele,attr,vm){
        var object = function(){ return vm.bds.object };
        scope.$watch(object,function(){
            vm.cof.setMainObject(vm.bds.object);
        },true);
    }

    var objectCompare = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/object-compare/objectCompare.html',
            controller: controller,
            controllerAs: 'compare',
            bindToController: true,
            link: link
        };
    }

    angular.module('blake').directive("objectCompare", objectCompare);

}());
(function(){

    var controller = function(){
        var vm = this;

        vm.strongTitle = '';
        vm.title = '';
        vm.date = ''
        vm.institutuion = ''
        vm.copyLtr =  '';
        vm.objNumber = '';


        switch(vm.type){
            case 'copyDesc':
                if(vm.virtual){
                    vm.title = vm.override;
                } else {
                    vm.title = 'Copy '+vm.object.archive_copy_id;
                    if(vm.object.source.objinfo.printdate){
                        vm.date = vm.object.source.objinfo.printdate['#text'];
                    }
                    vm.institution = vm.object.institution;
                }
                break;
            case 'objectSimple':
                if(vm.virtual){
                    vm.title = vm.object.title;
                    vm.objNumber = 'Object '+vm.object.object_number + vm.object.full_object_id.replace(/object [\d]+/g,'');
                } else {
                    vm.objNumber = vm.object.full_object_id;
                }
                break;
            case 'objectFull':
                if(vm.virtual){
                    vm.strongTitle = vm.object.copy_title;
                    vm.title = vm.object.title;
                } else {
                    vm.strongTitle = vm.object.title;
                    if(vm.object.archive_copy_id){
                        vm.copyLtr = 'Copy '+vm.object.archive_copy_id;
                    }
                    vm.objNumber = vm.object.full_object_id;
                }
        }

    }

    var objectDescription = function(){
        return {
            restrict: 'A',
            templateUrl: '/blake/static/directives/object-description/objectDescription.html',
            controller: controller,
            scope: {
                object: '=object',
                virtual: '=virtual',
                type: '@type',
                override: '=override',
            },
            controllerAs: 'objDesc',
            bindToController: true
        };
    }

    angular.module('blake').directive('objectDescription', objectDescription);

}());
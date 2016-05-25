(function() {

    var controller = function ($scope, $sessionStorage,$rootScope) {

        var vm = this;

        vm.$storage = $sessionStorage;

        vm.getOvpTitle = function(){
            return "adlksadf"
            if(angular.isDefined(vm.copy)){
                if(vm.copy.virtual == true){
                    if(vm.copy.bad_id == 'letters'){
                        return vm.copy.selectedObject.object_group;
                    } else {
                        return vm.work.title;
                    }
                } else {
                    var copyPhrase = vm.copy.archive_copy_id == null ? '' : ', Copy '+vm.copy.archive_copy_id;
                    return vm.copy.header.filedesc.titlestmt.title['@reg']+copyPhrase;
                }
            }
        }

    }

    controller.$inject = ['$scope', '$sessionStorage','$rootScope'];

    var workTitle = function () {

        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/work-title/workTitle.html',
            controller: controller,
            scope: {
                copy: '=copy',
                work: '=work',
            },
            controllerAs: 'workTitle',
            bindToController: true
        };
    }

    angular.module('blake').directive("workTitle", workTitle);


}());
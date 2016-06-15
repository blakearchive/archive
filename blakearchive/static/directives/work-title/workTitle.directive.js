(function() {

    /** @ngInject */
    var controller = function ($rootScope,BlakeDataService) {

        var vm = this;
        vm.bds = BlakeDataService;
        var title = "";
        var copyPhrase = "";

        if(!angular.isDefined($rootScope.view)){
            $rootScope.view = {
                mode: 'object',
                scope: 'image'
            }
        }

        vm.getTitle = function(){
            if(vm.bds.work.virtual == true){
                if(vm.bds.copy.bad_id == 'letters'){
                    title = vm.bds.object.object_group;
                    return title;
                } else {
                    title = vm.bds.work.title;
                    return title;
                }
            } else {
                if($rootScope.onWorkPage == true) {
                    title = vm.bds.work.title;
                    return title;
                }
                copyPhrase = vm.bds.copy.archive_copy_id == null ? '' : ' Copy '+vm.bds.copy.archive_copy_id;

                if(vm.bds.copy.header){
                    title = vm.bds.copy.header.filedesc.titlestmt.title['@reg'];
                }
                if($rootScope.view.mode == 'compare') {
                    return title;
                }
                return title;
            }
        }

        vm.getCopyPhrase = function() {
            return copyPhrase;
        }

        vm.getWorkId = function() {
            return vm.bds.work.bad_id;
        }

    }

    var workTitle = function () {

        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/work-title/workTitle.html',
            controller: controller,
            controllerAs: 'workTitle',
            bindToController: true
        };
    }

    angular.module('blake').directive("workTitle", workTitle);


}());
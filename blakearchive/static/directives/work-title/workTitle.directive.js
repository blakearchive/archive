(function() {

    /** @ngInject */
    var controller = function ($rootScope,BlakeDataService) {

        var vm = this;
        vm.bds = BlakeDataService;
        var title = "";
        var copyPhrase = "";
        var overlayContent = "";

        if(!angular.isDefined($rootScope.view)){
            $rootScope.view = {
                mode: 'object',
                scope: 'image'
            }
        }

        /*this really needs to be redone to be made less convoluted*/
        vm.getTitle = function(){
            if(vm.bds.work.virtual == true){
                if(vm.bds.copy.bad_id == 'letters'){
                    if($rootScope.onWorkPage == true) {
                        return "Letters";
                    }
                    title = vm.bds.object.object_group;
                    title = title.match(/(to.*)/);
                    return title[1].charAt(0).toUpperCase() + title[1].slice(1);;
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
                    if(title.match(/.*, The/)) {
                        title = "The " + title.match(/(.*), The/)[1];
                    }
                    return title;
                }
                if(title.match(/.*, The/)) {
                    title = "The " + title.match(/(.*), The/)[1];
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

        vm.setOverlayContent = function(contentSource) {
            overlayContent = contentSource; 
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
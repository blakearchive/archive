(function() {

    /** @ngInject */
    var controller = function ($rootScope,$routeParams,BlakeDataService) {

        var vm = this;
        vm.bds = BlakeDataService;
        var title = "";
        vm.showOverlay = false;

        /*this really needs to be redone to be made less convoluted*/
        /*vm.getTitle = function(){

            // For letters
            if(vm.bds.work.bad_id == 'letters')
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
        }*/

        vm.getTitle = function(){

            /*WORKS PAGES*/
            if($rootScope.showWorkTitle == 'work'){
                return vm.bds.work.title;
            }

            /*COPY PAGES*/
            //For letters
            if(vm.bds.work.bad_id == 'letters'){
                title = vm.bds.object.object_group;
                title = title.match(/(to.*)/);
                return title[1].charAt(0).toUpperCase() + title[1].slice(1);
            }
            //For Virtual Groups
            if(vm.bds.work.virtual){
                return vm.bds.work.title;
            }
            //For rest
            if(vm.bds.copy.header){
                title = vm.bds.copy.header.filedesc.titlestmt.title['@reg'];

            }
            if(title.match(/.*, The/)) {
                title = "The " + title.match(/(.*), The/)[1];
            }
            return title.trim();


        }

        vm.getCopyPhrase = function() {
            if(vm.bds.work.virtual){
                return '';
            } else {
                return vm.bds.copy.archive_copy_id == null ? '' : 'Copy '+vm.bds.copy.archive_copy_id;
            }
        }

        vm.getStaticPageTitle = function() {
            return $rootScope.staticPageTitle;
        }

    }

    var link = function(scope,ele,attr,vm){
        var selectedCopy = function(){return vm.bds.copy};
        scope.$watch(selectedCopy,function(){
           vm.showOverlay = false;
        });
    }

    var workTitle = function () {

        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/work-title/workTitle.html',
            controller: controller,
            link: link,
            controllerAs: 'workTitle',
            bindToController: true
        };
    }

    angular.module('blake').directive("workTitle", workTitle);


}());
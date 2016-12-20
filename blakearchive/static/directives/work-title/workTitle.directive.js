(function() {

    /** @ngInject */
    var controller = function ($rootScope,$routeParams,BlakeDataService) {

        var vm = this;
        vm.bds = BlakeDataService;
        var title = "";
        vm.showOverlay = false;

        vm.getTitle = function(){

            /*WORKS PAGES*/
            if($rootScope.showWorkTitle == 'work'){
                return vm.bds.work.title;
            }

            /*COPY PAGES*/
            //For letters
            if(vm.bds.work.bad_id == 'letters'){
                if(vm.bds.object.object_group){
                    title = vm.bds.object.object_group;
                    title = title.match(/(to.*)/);
                    return title[1].charAt(0).toUpperCase() + title[1].slice(1);
                }
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

        vm.getCompOrPrintDateString = function() {
            if(vm.bds.work.probable == "printing")
                return "Printed " + vm.bds.copy.print_date_string;
            else 
                return "Composed " + vm.bds.work.composition_date_string;
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
            templateUrl: '/static/directives/work-title/workTitle.html',
            controller: controller,
            link: link,
            controllerAs: 'workTitle',
            bindToController: true
        };
    }

    angular.module('blake').directive("workTitle", workTitle);


}());
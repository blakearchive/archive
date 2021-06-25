angular.module("blake").controller("WorkTitleController", function ($rootScope,$routeParams,BlakeDataService) {
    var vm = this;
    vm.bds = BlakeDataService;
    var title = "";
    vm.showOverlay = false;
    vm.showOverlayCopyInfo = false;
    vm.showOverlayExhibitContents  = false;

    vm.getTitle = function(){

        /*HOME PAGE*/
        if($rootScope.showWorkTitle == 'home') {
            return vm.bds.work.title;
        }

        /*WORKS PAGES*/
        if($rootScope.showWorkTitle == 'work'){
            return vm.bds.work.title;
        }


        if($rootScope.showWorkTitle == 'exhibit' && $rootScope.doneSettingExhibit){
            return vm.bds.exhibit.exhibit.title;
            console.log(vm.bds);
            //return $rootScope.selectedExhibit.exhibit.title;
        }
/*
        if($rootScope.showWorkTitle == 'preview' && $rootScope.doneSettingPreview){
            return vm.bds.preview.preview.title;
            console.log(vm.bds);
            //return $rootScope.selectedExhibit.exhibit.title;
        }
*/
        /*COPY PAGES*/
        //For letters
        if(vm.bds.work.bad_id == 'letters'){
            if(vm.bds.object.object_group){
                title = vm.bds.object.object_group;
                if(title.match(/\s(from.*)/)){
                    title = title.match(/\s(from.*)/);
                }
                else if(title.match(/\s(to.*)/)){
                    title = title.match(/\s(to.*)/);
                }
                return title[1].charAt(0).toUpperCase() + title[1].slice(1);
            }
        }

        if(vm.bds.work.bad_id == 'shakespearewc'){
            if(vm.bds.object.object_group){
                title = vm.bds.object.object_group;
                return title;
            }
        }

        if(vm.bds.work.bad_id == 'bb49'){
            if(vm.bds.object.object_group){
                title = vm.bds.object.object_group;
                return title;
            }
        }
        //For Virtual Groups
        if(vm.bds.work.virtual){
            return vm.bds.work.title;
        }
        //For rest
        if(vm.bds.copy.header && $rootScope.doneSettingCopy){
            title = vm.bds.copy.header.filedesc.titlestmt.title['@reg'];
            //title = vm.bds.copy.header.filedesc.titlestmt.title.main['#text'];
            //console.log(vm.bds.copy.header.filedesc.titlestmt.title.main['#text']);

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
        //console.log(vm.bds.copy);
        if(vm.bds.work.virtual){
            return '';
        } else if(vm.bds.copy.archive_set_id != null) {
            return  vm.bds.copy.archive_set_id;

        } else if(vm.bds.work.bad_id != 'bb134') {
            return vm.bds.copy.archive_copy_id == null ? '' : 'Copy '+vm.bds.copy.archive_copy_id;
        } else if(vm.bds.work.bad_id == 'bb134') {
            return vm.bds.copy.archive_copy_id == null ? '' : '#'+vm.bds.copy.archive_copy_id;
        }
    }

    vm.getStaticPageTitle = function() {
        return $rootScope.staticPageTitle;
    }
});

angular.module('blake').directive("workTitle", function () {
    let link = function (scope, ele, attr, vm) {
        let selectedCopy = function () {
            return vm.bds.copy
        };
        scope.$watch(selectedCopy, function () {
            vm.showOverlay = false;
        });
    };

    return {
        restrict: 'E',
        template: require('html-loader!./workTitle.html'),
        controller: "WorkTitleController",
        link: link,
        controllerAs: 'workTitle',
        bindToController: true
    };
});

angular.module('blake').controller("CopyTabsController", function ($rootScope,BlakeDataService) {

        var vm = this;

        vm.bds = BlakeDataService;

        vm.selectedTab = '#objects-in-copy';

        vm.showTab = function (id) {
            vm.selectedTab = id;
            $rootScope.selectedTab = id;

        }

        vm.getCopyOrWork = function(){
            if(angular.isDefined(vm.bds.copy)){
                if(vm.bds.work.virtual){
                    if(vm.bds.work.bad_id == 'letters'){
                        return 'Letter';
                    } else if (vm.bds.work.bad_id == 'shakespearewc') {
                        return 'Work'
                    } else {
                        return 'Object';
                    }
                } else if(vm.bds.copy.archive_set_id != null) {
                    return 'Set';

                } else if(vm.bds.work.bad_id != 'bb134') {
                    return 'Copy';
                } else if(vm.bds.work.bad_id == 'bb134') {
                    return 'Receipt';
                }
            }
        }

        vm.getCopyOrGroup = function(){
            if(angular.isDefined(vm.bds.copy)){
                if(vm.bds.work.medium == 'exhibit')
                    return 'Exhibit';
                if(vm.bds.work.virtual){
                    if(vm.bds.work.bad_id == 'letters'){
                        return 'Letter';
                    } else if(vm.bds.work.bad_id == 'shakespearewc'){
                        return 'Work';
                    } else {
                        return 'Group';
                    }
                } else if(vm.bds.copy.archive_set_id != null) {
                    return 'Set';

                } else if(vm.bds.work.bad_id != 'bb134') {
                    return 'Copy';
                } else if(vm.bds.work.bad_id == 'bb134') {
                    return 'Receipt';
                }
            }
        }

        vm.changeObject = function(object){
            vm.bds.changeObject(object);
            $rootScope.view.mode = 'object';
            $rootScope.view.scope = 'image';
        }
    });

angular.module('blake').directive('copyTabs', function() {
    let link = function (scope, ele, attr, vm) {
        let object = function () {
            return vm.bds.object
        };
        scope.$watch(object, function () {
            vm.selectedTab = '#objects-in-copy';
        }, true);
    };

    return {
        restrict: 'E',
        template: require("html-loader!./copyTabs.html"),
        controller: "CopyTabsController",
        controllerAs: 'tabs',
        bindToController: true,
        link: link
    }
});


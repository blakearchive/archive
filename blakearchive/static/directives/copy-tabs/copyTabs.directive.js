/**
 * Created by lukeluke on 1/21/16.
 */
(function () {

    /** @ngInject */
    var controller = function ($rootScope,BlakeDataService) {

        var vm = this;

        vm.bds = BlakeDataService;

        vm.selectedTab = '#objects-in-copy';

        vm.showTab = function (id) {
            vm.selectedTab = id;
        }

        vm.getCopyOrWork = function(){
            if(angular.isDefined(vm.bds.copy)){
                if(vm.bds.work.virtual){
                    if(vm.bds.work.bad_id == 'letters'){
                        return 'Letter';
                    } else {
                        return 'Object';
                    }
                } else {
                    return 'Copy';
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
                    } else {
                        return 'Group';
                    }
                } else {
                    return 'Copy';
                }
            }
        }

        vm.changeObject = function(object){
            vm.bds.changeObject(object);
            $rootScope.view.mode = 'object';
            $rootScope.view.scope = 'image';
        }
    }

    var link = function(scope,ele,attr,vm){
        var object = function(){ return vm.bds.object };
        scope.$watch(object,function(){
            vm.selectedTab = '#objects-in-copy';
        },true);
    }

    var copyTabs = function() {
        return {
            restrict: 'E',
            templateUrl: "/static/directives/copy-tabs/copyTabs.html",
            controller: controller,
            controllerAs: 'tabs',
            bindToController: true,
            link: link
        }
    }

    angular.module('blake').directive('copyTabs', copyTabs);

}());
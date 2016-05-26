/**
 * Created by lukeluke on 1/21/16.
 */
(function () {

    /** @ngInject */
    var controller = function ($scope,$routeParams,$timeout,$sessionStorage,BlakeDataService) {

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
                        return 'Work';
                    }
                } else {
                    return 'Copy';
                }
            }
        }

        vm.getCopyOrGroup = function(){
            if(angular.isDefined(vm.bds.copy)){
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
            //vm.$storage.view.mode = 'object';
            //vm.$storage.view.scope = 'image';
        }


        /*$scope.$on('copyCtrl::objectChanged',function(object){
            if($routeParams.descId){
                vm.selectedTab = '#objects-in-copy';
            } else {
                vm.selectedTab = angular.isDefined($routeParams.tab) ? '#'+$routeParams.tab : '#objects-in-copy';
            }
        });*/

        /*if($routeParams.tab) {
            $timeout(function () {
                $('html, body').animate({
                    scrollTop: $('#archive-tabs').offset().top
                }, 'slow')
            }, 0);
        }*/
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
            templateUrl: "/blake/static/directives/copy-tabs/copyTabs.html",
            controller: controller,
            controllerAs: 'tabs',
            bindToController: true,
            link: link
        }
    }

    angular.module('blake').directive('copyTabs', copyTabs);

}());
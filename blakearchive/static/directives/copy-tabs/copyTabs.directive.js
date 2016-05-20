/**
 * Created by lukeluke on 1/21/16.
 */
(function () {

    var controller = function ($scope, BlakeDataService,$routeParams,$timeout,$rootScope) {

        var vm = this;

        vm.showTab = function (id) {
            vm.selectedTab = id;
        }

        vm.getHeader = function(){
            if(angular.isDefined(vm.copy)){
                if(vm.copy.virtual == true){
                    if(angular.isDefined(vm.work)){
                        return vm.work.title;
                    }
                } else {
                    return vm.copy.header.filedesc.titlestmt.title.main['#text'];
                }
            }
        }
        vm.getOicSubheader = function(){
            if(angular.isDefined(vm.copy)){
                if(vm.copy.virtual == true){
                    return '';
                } else {
                    var copyPhrase = vm.copy.archive_copy_id == null ? '' : 'Copy '+vm.copy.archive_copy_id+', ';
                    var printDate = angular.isDefined(vm.copy.source.objinfo.printdate) ? vm.copy.source.objinfo.printdate['#text'] + ' ' : '';
                    var instPhrase = vm.copy.institutuion == null ? '' : '('+vm.copy.institution+')';
                    return copyPhrase+printDate+instPhrase;
                }
            }
        }

        vm.getCopyOrGroup = function(){
            if(angular.isDefined(vm.copy)){
                if(vm.copy.virtual){
                    if(vm.copy.bad_id == 'letters'){
                        return 'Letter';
                    } else {
                        return 'Work';
                    }
                } else {
                    return 'Copy';
                }
            }
        }

        $scope.$on('copyCtrl::objectChanged',function(object){
            if($routeParams.descId){
                vm.selectedTab = '#objects-in-copy';
            } else {
                vm.selectedTab = angular.isDefined($routeParams.tab) ? '#'+$routeParams.tab : '#objects-in-copy';
            }
        });

        if($routeParams.tab) {
            $timeout(function () {
                $('html, body').animate({
                    scrollTop: $('#archive-tabs').offset().top
                }, 'slow')
            }, 0);
        }
    }

    controller.$inject = ['$scope', 'BlakeDataService','$routeParams','$timeout','$rootScope'];

    var copyTabs = function() {
        return {
            restrict: 'EA',
            templateUrl: "/blake/static/directives/copy-tabs/copyTabs.html",
            controller: controller,
            controllerAs: 'tabs',
            scope: {
                copy: '=copy',
                work: '=work',
                changeObject: '&',
                resetView: '&',
                resetCompare: '&'
            },
            /*link:function(scope,elem,attr){
                scope.changeObject({object: object});
            },*/
            bindToController: true
        }
    }

    angular.module('blake').directive('copyTabs', copyTabs);

}());
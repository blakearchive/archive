/**
 * Created by lukeluke on 1/21/16.
 */
(function () {

    var controller = function ($scope, $localStorage, BlakeDataService) {

        var vm = this;

        vm.showTab = function (id) {
            vm.selectedTab = id;
        }

        vm.selectedTab = '#objects-in-copy';

        vm.getObjectTitle = function (obj) {
            try {
                return obj.header.filedesc.titlestmt.title.main['#text'];
            } catch (e) {
                return obj.title;
            }
        };

        $scope.$on('copyCtrl::changeObject',function(){
            vm.selectedTab = '#objects-in-copy';
        });

    }

    controller.$inject = ['$scope','$localStorage', 'BlakeDataService'];

    var copyTabs = function() {
        return {
            restrict: 'EA',
            templateUrl: "/blake/static/directives/copy-tabs/copyTabs.html",
            controller: controller,
            controllerAs: 'tabs',
            scope: {
                copy: '=copy',
                work: '=work',
            },
            bindToController: true,
        }
    }

    angular.module('blake').directive('copyTabs', copyTabs);

}());
/**
 * Created by nathan on 2/13/15.
 */

(function() {

    var controller = function ($scope, BlakeDataService) {

        var vm = this;

        vm.init = function(){
            vm.copy = BlakeDataService.selectedCopy;
            vm.obj = BlakeDataService.selectedObject;
            if(vm.copy && vm.obj){
                if (vm.copy.source && vm.copy.header) {
                    vm.copySource = vm.copy.source;
                    vm.copyHeader = vm.copy.header;
                } else {
                    vm.copySource = vm.obj.source;
                    vm.copyHeader = vm.obj.header;
                }
            }
        }

        vm.init();


        $scope.$on('update:copy', function () {
            vm.init();
        });


        vm.getOriginationRole = function (role) {
            if (role) {
                if (role.join) {
                    var roleText = [];
                    role.forEach(function (role) {
                        roleText.push(role['#text']);
                    });
                    return roleText.join(' ');
                } else {
                    return role['#text'];
                }
            }
        }
    }

    controller.$inject = ['$scope', 'BlakeDataService'];

    var copyInformation = function () {
        return {
            restrict: 'E',
            templateUrl: "/blake/static/directives/copy-information/copyInformation.html",
            controller: controller,
            controllerAs: 'info',
            bindToController: true,
        }
    }

    angular.module('blake').directive("copyInformation", copyInformation);

}());

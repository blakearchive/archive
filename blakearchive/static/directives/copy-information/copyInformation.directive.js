/**
 * Created by nathan on 2/13/15.
 */

(function() {

    var controller = function ($scope, BlakeDataService) {

        var vm = this;

        vm.getHeader = function(){
            if(angular.isDefined(vm.copy)){
                if(vm.copy.virtual){
                    return vm.copy.selectedObject.header;
                } else {
                    return vm.copy.header;
                }
            }
        }
        vm.getSource = function(){
            if(angular.isDefined(vm.copy)) {
                if (vm.copy.virtual) {
                    return vm.copy.selectedObject.source;
                } else {
                    return vm.copy.source;
                }
            }
        }

        /*vm.init = function(){
            if(angular.isDefined(vm.copy)){
                console.log('copy info set');
                if(vm.copy.virtual){

                } else {
                    vm.copySource = vm.copy.source;
                    vm.copyHeader = vm.copy.header;
                }
            } else {
                console.log('copy info not set');
            }
        }*/

        /*$scope.$on('global::copyInfo',function(event,data){
            vm.copySource = data.source;
            vm.copyHeader = data.header;
        });*/

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

    var copyInformation = function(){
        return {
            restrict: 'E',
            templateUrl: "/blake/static/directives/copy-information/copyInformation.html",
            controller: controller,
            controllerAs: 'info',
            scope:{
                copy: '=copy'
            },
            bindToController: true
        }
    }

    angular.module('blake').directive("copyInformation", copyInformation);

}());

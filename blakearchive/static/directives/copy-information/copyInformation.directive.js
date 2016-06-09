/**
 * Created by nathan on 2/13/15.
 */

(function() {

    /** @ngInject */
    var controller = function () {

        var vm = this;

        vm.getHeader = function(){
            if(vm.copy){
                if(vm.copy.virtual){
                    return vm.object.header;
                } else {
                    return vm.copy.header;
                }
            }
        }

        vm.getSource = function(){
            if(vm.copy){
                if (vm.copy.virtual) {
                    return vm.object.source;
                } else {
                    return vm.copy.source;
                }
            }
        }

        vm.getOrigination = function(){
            var origination = angular.isDefined(vm.getSource()) ? vm.getSource().objdescid.origination : '';
            if(angular.isArray(origination)){
                return origination;
            } else {
                return [origination];
            }
        }

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


    var copyInformation = function(){
        return {
            restrict: 'E',
            templateUrl: "/blake/static/directives/copy-information/copyInformation.html",
            controller: controller,
            controllerAs: 'info',
            scope:{
                highlight: '@highlight',
                copy: '=copy',
                object: '=object'
            },
            bindToController: true
        }
    }

    angular.module('blake').directive("copyInformation", copyInformation);

}());

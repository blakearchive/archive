/**
 * Created by nathan on 2/13/15.
 */

(function() {

    /** @ngInject */
    var controller = function (BlakeDataService) {

        var vm = this;
        vm.bds = BlakeDataService;

        vm.getHeader = function(){
            if(vm.bds.work.virtual){
                return vm.bds.object.header;
            } else {
                return vm.bds.copy.header;
            }
        }

        vm.getSource = function(){
            if (vm.bds.work.virtual) {
                return vm.bds.object.source;
            } else {
                return vm.bds.copy.source;
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
                highlight: '@highlight'
            },
            bindToController: true
        }
    }

    angular.module('blake').directive("copyInformation", copyInformation);

}());

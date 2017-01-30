angular.module('blake').controller("CopyInformationController", function () {
    var vm = this;

    vm.getHeader = function(){
        if(vm.copy){
            if(vm.copy.virtual){
                return vm.object.header;
            } else {
                return vm.copy.header;
            }
        }
    };

    vm.getSource = function(){
        if(vm.copy){
            if (vm.copy.virtual) {
                return vm.object.source;
            } else {
                return vm.copy.source;
            }
        }
    };

    vm.getOrigination = function(){
        var origination = angular.isDefined(vm.getSource()) ? vm.getSource().objdescid.origination : '';
        if(angular.isArray(origination)){
            return origination;
        } else {
            return [origination];
        }
    };

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
});

angular.module('blake').directive("copyInformation", function(){
    return {
        restrict: 'E',
        template: require("html-loader!./copyInformation.html"),
        controller: "CopyInformationController",
        controllerAs: 'info',
        scope:{
            highlight: '@highlight',
            copy: '=copy',
            object: '=object'
        },
        bindToController: true
    }
});


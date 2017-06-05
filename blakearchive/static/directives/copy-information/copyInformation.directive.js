angular.module('blake').controller("CopyInformationController", function () {
    let vm = this;

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
                console.log(vm.object.source);
                return vm.object.source;
            } else {
                console.log(vm.copy.source);
                return vm.copy.source;
            }
        }
    };

    vm.getOrigination = function(){
        let origination = typeof vm.getSource() !== "undefined" ? vm.getSource().objdescid.origination : '';
        if(Array.isArray(origination)){
            return origination;
        } else {
            return [origination];
        }
    };

    vm.getOriginationRole = function (role) {
        if (role) {
            if (role.join) {
                let roleText = [];
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


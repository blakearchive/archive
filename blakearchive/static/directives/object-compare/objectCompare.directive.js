(function(){


    var controller = function ($scope, WindowSize, $timeout, $rootScope, $sessionStorage) {
        var vm = this;

        vm.getOvpTitle = function(){
            if(angular.isDefined(vm.copy)){
                if(vm.copy.virtual == true){
                    return vm.copy.selectedObject.title;
                } else {
                    //var copyPhrase = vm.copy.archive_copy_id == null ? '' : ', Copy '+vm.copy.archive_copy_id;
                    return vm.copy.header.filedesc.titlestmt.title['@reg'];
                }
            }
        }

        vm.$storage = $sessionStorage;

        vm.setActive = function(obj){
            angular.forEach(vm.$storage.comparisonObjects, function(v,k){
                v.isActive = false;
            });
            obj.isActive = true;
            $rootScope.$broadcast('compareCtrl::objectChanged',obj);
        }

        $scope.$on('copyCtrl::objectChanged',function(){
            vm.$storage.comparisonObjects[0].isActive = true;
        });

    }

    controller.$inject = ['$scope','WindowSize','$timeout','$rootScope','$sessionStorage'];

    var objectCompare = function(){
        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/object-compare/objectCompare.html',
            controller: controller,
            scope: {
                copy: '=copy',
                work: '=work',
                changeObject: '&',
                changeCopy: '&'
            },
            controllerAs: 'compare',
            bindToController: true
        };
    }

    angular.module('blake').directive("objectCompare", objectCompare);

}());
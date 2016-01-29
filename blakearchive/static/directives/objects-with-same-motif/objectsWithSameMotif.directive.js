/**
 * Created by nathan on 2/3/15.
 */
(function() {

    var controller = function ($scope, BlakeDataService) {

        var vm = this;

        vm.init = function(){
            var obj = BlakeDataService.selectedObject;
            if (obj) {
                vm.item = obj;
                vm.objects = BlakeDataService.sameMotif;
            }
        }

        vm.init();

        $scope.$on('update:object', function () {
            vm.init();
        });

    }

    controller.$inject = ['$scope', 'BlakeDataService'];

    var objectsWithSameMotif = function () {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: "/blake/static/directives/objects-with-same-motif/objectsWithSameMotif.html",
            controller: controller,
            controllerAs: 'motif',
            bindToController: true,
        }
    }

    angular.module('blake').directive("objectsWithSameMotif", objectsWithSameMotif);

}());

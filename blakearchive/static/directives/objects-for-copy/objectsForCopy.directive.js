/**
 * Created by nathan on 2/3/15.
 */

(function () {

    var controller = function($scope,BlakeDataService){
        var vm = this;

        vm.init = function(){
            vm.copy = BlakeDataService.selectedCopy;
            vm.work = BlakeDataService.selectedWork;
            vm.objects = BlakeDataService.selectedCopyObjects;
        }

        vm.init();

        $scope.$on('update:copy',function(){
            vm.init();
        });

    }

    controller.$inject = ['$scope','BlakeDataService'];

    var objectsForCopy = function(){
        return {
            restrict: 'EA',
            templateUrl: "/blake/static/directives/objects-for-copy/objectsForCopy.html",
            controller: controller,
            controllerAs: 'oic',
            bindToController: true
        }
    }

    angular.module('blake').directive("objectsForCopy", objectsForCopy);

}());


/*
Appears to be unnecessary, but I'll leave it here until Nathan takes a look. Viewer certainly loads faster without it.

angular.module('blake').controller("ObjectsForCopyController", ['$scope', 'BlakeDataService', function ($scope, BlakeDataService) {
    $scope.$watch(BlakeDataService.getSelectedCopy, function (copy) {
        if (copy) {
            $scope.copy = copy;
            BlakeDataService.getObjectsForCopy(copy.bad_id).then(function (data) {
                $scope.objects = data;
            })
        }
    });
}]);*/

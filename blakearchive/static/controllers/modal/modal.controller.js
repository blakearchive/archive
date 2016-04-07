/**
 * Created by lukeluke on 1/25/16.
 */

(function () {

    var controller = function ($scope,$modalInstance) {

        $scope.close = function () {
            $modalInstance.close();
        };

    };


    controller.$inject = ['$scope','$modalInstance'];

    angular.module('blake').controller('ModalController', controller);

}());
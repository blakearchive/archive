angular.module('blake').controller('ModalController', function ($scope,$modalInstance) {
    $scope.close = function () {
        $modalInstance.close();
    };

});
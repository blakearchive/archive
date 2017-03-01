angular.module("blake").controller("ObjectViewerController", function($rootScope, $modal, BlakeDataService, $scope){
    var vm = this;

    vm.bds = BlakeDataService;

    $rootScope.onWorkPage = false;
    // vm.dpi = $rootScope.dpivalue;
    //
    // $scope.$watch(_ => $rootScope.dpivalue, function() {
    //         if ($rootScope.dpivalue == '300') {
    //                 vm.dpi = "300";
    //         }
    //         else {
    //                 vm.dpi = "100";
    //         }
    //     }, true);
});

angular.module('blake').directive("objectViewer", function(){
    return {
        restrict: 'E',
        template: require('html-loader!./objectViewer.html'),
        controller: "ObjectViewerController",
        controllerAs: 'viewer',
        bindToController: true
    };
});
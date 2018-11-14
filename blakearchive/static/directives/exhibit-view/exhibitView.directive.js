angular.module("blake").controller("ExhibitViewController",
    function($rootScope, BlakeDataService, $scope, $modal, $cookies, $window) {
    var vm = this;
    vm.bds = BlakeDataService;
    console.log("bds exhibitId: =="+vm.bds.exhibit.exhibit_id+"==");
    var htmlPath = "'/api/exhibit-html/illum'";//+vm.bds.exhibit.exhibit_id;
    console.log("htmlPath: =="+htmlPath+"==");
});

angular.module('blake').directive("exhibitView", function() {
    return {
        restrict: 'E',
        template: require('html-loader!./exhibitView.html'),
        controller: "ExhibitViewController",
        controllerAs: 'exhibit',
        bindToController: true
    };
});

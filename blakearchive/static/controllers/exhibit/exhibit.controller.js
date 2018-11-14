angular.module('blake').controller('ExhibitController', function ($scope,$routeParams,$rootScope,$window,$modal,$cookies,BlakeDataService,imageManipulation,CompareObjectsFactory) {
    var vm = this;
    var exhibitId = $routeParams.exhibitId;
    vm.bds= BlakeDataService;
    console.log("Exhibit ID: "+exhibitId);

    vm.bds.setSelectedExhibit(exhibitId);
    
});

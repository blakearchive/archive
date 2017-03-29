angular.module("blake").controller("ObjectsInCopyTabController", function (BlakeDataService) {
    let vm = this;
    vm.bds = BlakeDataService;

    vm.changeObject = function(object){
        if($rootScope.view.mode = 'compare') {
            vm.compareText = "Select All Objects";
            vm.selectedAll = false;
            vm.cof.resetComparisonObjects();
            $rootScope.view.mode = 'object';
            $rootScope.view.scope = 'image';
        }

        vm.bds.changeObject(object);
    };

    vm.getCopyOrGroup = function(){
        if(angular.isDefined(vm.bds.copy)){
            if(vm.bds.work.medium == 'exhibit')
                return 'Exhibit';
            if(vm.bds.work.virtual){
                if(vm.bds.work.bad_id == 'letters'){
                    return 'Letter';
                } else {
                    return 'Group';
                }
            } else {
                return 'Copy';
            }
        }
    }
});

angular.module("blake").component("objectsInCopyTab", {
    template: require("html-loader!./template.html"),
    controller: "ObjectsInCopyTabController",
    controllerAs: "oic"
});
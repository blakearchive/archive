angular.module("blake").controller("SupplementalImageViewerController", function ($rootScope, BlakeDataService, ObjectViewerService) {
    let vm = this;
    vm.rs = $rootScope;
    vm.bds = BlakeDataService;
    vm.ovs = ObjectViewerService;

    vm.getSource = function(){
        if(vm.copy){
            if (vm.copy.virtual) {
                return vm.object.source;
            } else {
                return vm.copy.source;
            }
        }
    };
});

angular.module("blake").component("supplementalImageViewer", {
    template: require("html-loader!./template.html"),
    replace: true,
    bindToController: true,
    controller: "SupplementalImageViewerController",
    controllerAs: "siv",
    scope:{
            highlight: '@highlight',
            copy: '=copy',
            object: '=object'
        }
});
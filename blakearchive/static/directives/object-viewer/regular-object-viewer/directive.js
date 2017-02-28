angular.module("blake").controller("RegularObjectViewerController", function ($rootScope, BlakeDataService, ObjectViewerService) {
    let vm = this;
    vm.rs = $rootScope;
    vm.bds = BlakeDataService;
    vm.ovs = ObjectViewerService;
});

angular.module("blake").component("regularObjectViewer", {
    template: require("html-loader!./template.html"),
    replace: true,
    bindToController: true,
    controller: "RegularObjectViewerController",
    controllerAs: "rov"
});
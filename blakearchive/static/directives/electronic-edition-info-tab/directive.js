angular.module("blake").controller("ElectronicEditionInfoTabController", function (BlakeDataService) {
    let vm = this;
    vm.bds = BlakeDataService;
});

angular.module("blake").component("electronicEditionInfoTab", {
    template: require("html-loader!./template.html"),
    controller: "ElectronicEditionInfoTabController",
    controllerAs: "info"
});
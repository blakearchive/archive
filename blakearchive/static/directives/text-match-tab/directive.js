angular.module("blake").controller("TextMatchTabController", function (BlakeDataService) {
    let vm = this;
    vm.bds = BlakeDataService;
});

angular.module("blake").component("textMatchTab", {
    template: require("html-loader!./template.html"),
    controller: "TextMatchTabController",
    controllerAs: "tm"
});
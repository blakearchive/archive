angular.module("blake").controller("TextualReferenceTabController", function (BlakeDataService) {
    let vm = this;
    vm.bds = BlakeDataService;
});

angular.module("blake").component("textualReferenceTab", {
    template: require("html-loader!./template.html"),
    controller: "TextualReferenceTabController",
    controllerAs: "tr"
});
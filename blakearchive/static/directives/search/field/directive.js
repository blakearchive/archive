angular.module("blake").controller("FieldSearchFieldController", function (SearchController) {
    let vm = this;
    vm.s = SearchController;
});

angular.module("blake").component("fieldSearchField", {
    template: require("html-loader!./template.html"),
    controller: "FieldSearchFieldController",
    controllerAs: "fsf"
});
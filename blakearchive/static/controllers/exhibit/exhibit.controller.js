angular.module('blake').controller('ExhibitController', function ($scope,$routeParams,$rootScope,$window,$modal,$cookies,BlakeDataService,imageManipulation,CompareObjectsFactory,$http) {
    var vm = this;
    var exhibitId = $routeParams.exhibitId;
    vm.images = [];
    vm.captions = [];

    vm.the_exhibit = BlakeDataService.getExhibit(exhibitId);

    BlakeDataService.getImagesForExhibit(exhibitId).then(function(result){
      vm.images = result;
      //console.log("--------"+vm.images);
      for (var i=0; i< vm.images.length;i++){
        BlakeDataService.getCaptionsForImage(vm.images[i].image_id).then(function(r2){
          //console.log("--------"+r2);
          vm.captions.push(r2);
        });
      }
    });



    vm.bds= BlakeDataService;
    console.log("Exhibit ID: "+exhibitId);

    vm.bds.setSelectedExhibit(exhibitId);
    //console.log("===>>>>"+JSON.stringify(vm.bds));
    $http.get("/api/exhibit-html/"+exhibitId).then(function(response){
      vm.exhibit_article_content = response.data;
    });


});

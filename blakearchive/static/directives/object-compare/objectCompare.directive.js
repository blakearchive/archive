angular.module("blake").controller("ObjectCompareController", function ($rootScope,BlakeDataService,CompareObjectsFactory,$scope) {
    var vm = this;
    vm.bds = BlakeDataService;
    vm.cof = CompareObjectsFactory;
    $rootScope.onWorkPage = false;
    $scope.dpi = $rootScope.dpivalue;
    vm.fragment = '';

    vm.getOvpTitle = function(){
        if(angular.isDefined(vm.bds.copy)){
            if(vm.bds.work.virtual == true){
                if(vm.bds.copy.bad_id == 'letters'){
                    return vm.bds.object.object_group;
                } else {
                    return vm.bds.work.title;
                }
            } else {
                var copyPhrase = vm.bds.copy.archive_copy_id == null ? '' : ', Copy '+vm.bds.copy.archive_copy_id;

                if(vm.bds.copy.header){
                    copyPhrase = vm.bds.copy.header.filedesc.titlestmt.title['@reg']+copyPhrase
                }

                return copyPhrase;
            }
        }
    }

    vm.changeObject = function(object){
        //console.log(object);
        $rootScope.descIDFromCompare = object.desc_id;
        //console.log($rootScope.descIDFromCompare);
        vm.bds.changeCopy(object.copy_bad_id,object.desc_id);
        if($rootScope.selectedTab == '#objects-with-text-matches') {
            vm.cof.setMainObject(object);
        }
    }

    vm.goToObject = function(object){
        vm.compareText = "Select All Objects";
        vm.selectedAll = false;
        vm.cof.resetComparisonObjects();
        $rootScope.view.mode = 'object';
        $rootScope.view.scope = 'image';
        vm.changeObject(object);
    }

    $scope.$watch(function() {
        return $rootScope.dpivalue;
        }, function() {

            if ($rootScope.dpivalue == '300') {
                    $scope.dpi = "300";
            }
            else {
                    $scope.dpi = "100";
            }

        }, true);
});

angular.module('blake').directive("objectCompare", function () {
    let link = function(scope,ele,attr,vm){
        let object = function(){ return vm.bds.object };
        scope.$watch(object,function(){
            vm.cof.setMainObject(vm.bds.object);
        },true);
    };

    return {
        restrict: 'E',
        template: require('html-loader!./objectCompare.html'),
        controller: "ObjectCompareController",
        controllerAs: 'compare',
        bindToController: true,
        link: link
    };
});

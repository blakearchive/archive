angular.module("blake").controller("ObjectReadingController", function($rootScope,BlakeDataService,$scope){
    var vm = this;
    vm.bds = BlakeDataService;
    $rootScope.onWorkPage = false;
    $scope.dpi = $rootScope.dpivalue;
    //$rootScope.view.scope = 'both';
    vm.apparatus = 'transcriptions';
    $rootScope.activeapparatus = 'transcriptions';
    $rootScope.hover = false;
    vm.compareCopyObjects = [];
    vm.compareCopyId = '';
    vm.compareCopyPrintDateString = '';
    vm.rs = $rootScope;
    vm.zoomMessage = 'Click, then mouse over the image';

    console.log(vm.bds);

    vm.zoom = function(){
        $rootScope.zoom = !$rootScope.zoom;
        /*if($rootScope.zoom == false) {
            vm.zoomMessage = 'Click, then mouse over the image';
        }
        else {
            vm.zoomMessage = 'Click to turn off magnifer';
        }*/
        console.log($rootScope.zoom);
    };

    vm.showCompareWith = function (bad_id) {

        vm.compareCopyObjects = [];

        vm.bds.copyObjects.forEach(function(copyObject) {
            BlakeDataService.getSameMatrixObjectFromOtherCopy(copyObject.desc_id,bad_id).then(function(result){
                if(copyObject.desc_id != result.desc_id) {
                    vm.compareCopyObjects.push(result);
                    vm.compareCopyId = result.archive_copy_id;
                    vm.compareCopyPrintDateString = result.copy_print_date_string;
                }
                else {
                    vm.compareCopyObjects.push(null);
                }
            });
        });

        /*BlakeDataService.getCopy(bad_id).then(function(result){
            //console.log(result);
            vm.compareCopyId = result.archive_copy_id;
        });
        */

        vm.apparatus = 'comparewith';
        $rootScope.activeapparatus = 'comparewith';
    }

    vm.showIllustrationDescriptions = function() {
        vm.apparatus = 'illustrationdescriptions';
        $rootScope.activeapparatus = 'illustrationdescriptions';
    }

    vm.showTranscriptions = function() {
        vm.apparatus = 'transcriptions';
        $rootScope.activeapparatus = 'transcriptions';
    }

    vm.showEditorsNotes = function () {
        vm.apparatus = 'editorsnotes';
        $rootScope.activeapparatus = 'editorsnotes';
    }

    vm.showImagesOnly = function () {
        vm.apparatus = 'imagesonly';
        $rootScope.activeapparatus = 'imagesonly';
    }

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
        vm.bds.changeObject(object);
        $rootScope.view.mode = 'object';
        $rootScope.view.scope = 'image';
        $rootScope.persistentmode = 'gallery';
        $rootScope.states.activeItem = 'gallery';
    }

    vm.changeCopy = function(copy_id,desc_id){
        vm.bds.changeCopy(copy_id, desc_id);
        $rootScope.view.mode = 'object';
        $rootScope.view.scope = 'image';
        $rootScope.persistentmode = 'gallery';
        $rootScope.states.activeItem = 'gallery';
    }

    vm.cssSafeId = function(string){
        return string.replace(/\./g,'-');
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

angular.module('blake').directive("objectReading", function(){
    return {
        restrict: 'E',
        template: require('html-loader!./objectReading.html'),
        controller: "ObjectReadingController",
        controllerAs: 'read',
        bindToController: true
    };
});
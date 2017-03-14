angular.module("blake").controller("ObjectReadingController", function($rootScope,BlakeDataService,$scope){
    var vm = this;
    vm.bds = BlakeDataService;
    $rootScope.onWorkPage = false;
    $scope.dpi = $rootScope.dpivalue;
    //$rootScope.view.scope = 'both';
    vm.apparatus = 'transcriptions';
    $rootScope.defaultapparatus = 'transcriptions';

    vm.showIllustrationDescriptions = function() {
        vm.apparatus = 'illustrationdescriptions';
    }

    vm.showTranscriptions = function() {
        vm.apparatus = 'transcriptions';
    }

    vm.showEditorsNotes = function () {
        vm.apparatus = 'editorsnotes';
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
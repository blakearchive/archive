angular.module('blake').controller('ShowMeController', function ($rootScope,$routeParams,$modal,$cookies,BlakeDataService,$scope) {
    var vm = this;
    vm.bds = BlakeDataService;

    $rootScope.showmePage = true;
    $scope.dpi = $rootScope.dpivalue;

    vm.what = $routeParams.what;
    $rootScope.showmeType = $routeParams.what;

    BlakeDataService.setSelectedCopy($routeParams.copyId,$routeParams.descId);

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


    vm.getOvpTitle = function(){
        if(angular.isDefined(vm.bds.copy)){
            if(vm.bds.work.virtual == true){
                if(vm.bds.copy.bad_id == 'letters'){
                    return vm.bds.object.object_group;
                } else {
                    return vm.bds.work.title;
                }
            } else {
                var copyPhrase = vm.bds.copy.archive_copy_id == null ? '' : ' Copy '+vm.bds.copy.archive_copy_id;

                if(vm.bds.copy.header){
                    title = vm.bds.copy.header.filedesc.titlestmt.title['@reg'];
                    if(title.match(/.*, The/)) {
                        title = "The " + title.match(/(.*), The/)[1];
                    }
                    copyPhrase = title+copyPhrase
                }

                return copyPhrase;
            }
        }
    }

    vm.getPreviousObject = function(){

        var list = [];

        if(vm.bds.work.bad_id == 'letters'){
            vm.bds.copyObjects.forEach(function(obj){
                if(obj.object_group == vm.bds.object.object_group){
                    list.push(obj);
                }
            })
        } else {
            list = vm.bds.copyObjects;
        }

        var obj_desc_id = vm.bds.object.supplemental ? vm.bds.object.supplemental : vm.bds.object.desc_id;

        if(list){
            for (var i = list.length; i--;) {
                if (list[i].desc_id == obj_desc_id) {
                    if (list[i - 1]) {
                        return list[i - 1];
                    } else {
                        return false;
                    }
                }
            }
        }

    }

    vm.getNextObject = function(){

        var list = [];

        if(vm.bds.work.bad_id == 'letters'){
            vm.bds.copyObjects.forEach(function(obj){
                if(obj.object_group == vm.bds.object.object_group){
                    list.push(obj);
                }
            })
        } else {
            list = vm.bds.copyObjects;
        }

        var obj_desc_id = vm.bds.object.supplemental ? vm.bds.object.supplemental : vm.bds.object.desc_id;

        if(list){
            for (var i = list.length; i--;) {
                if (list[i].desc_id == obj_desc_id) {
                    if(list[i + 1]){
                        return list[i + 1];
                    } else {
                        return false;
                    }
                }
            }
        }

    };

    vm.changeObject = function(object){
        vm.bds.changeObject(object);
    }

    vm.trueSize = function(){
        if(angular.isDefined($cookies.getObject('clientPpi')) && angular.isDefined((vm.bds.copy))){
            var size = vm.bds.object.physical_description.objsize['#text'].split(' '),
                clientPpi = $cookies.getObject('clientPpi'),
                x = size[2],
                y = size[0],
                unit = size[3],
                width = x / 2.54 * clientPpi.ppi,
                height = y / 2.54 * clientPpi.ppi;
            //console.log('x='+x+'  y='+y+'  unit='+unit+'  ppi='+clientPpi.ppi);
            if(unit == 'mm.'){
                width = width * 10;
                height = height * 10;
            }

             return {'height':height+'px','width':width+'px'}

        }
    }

    vm.clientPpiOpen = function(){
        var clientDpiModalInstance = $modal.open({
            template: '<client-ppi></client-ppi>',
            controller: 'ModalController',
            size: 'lg'
        });
    }

});
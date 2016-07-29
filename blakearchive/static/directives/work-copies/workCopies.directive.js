(function() {

    /** @ngInject */
    var controller = function (BlakeDataService) {

        var vm = this;
        vm.bds = BlakeDataService;
        vm.rows = [];
        vm.copyCount = 0;
        console.log(vm.bds);

        /*vm.sortCopies = function(copies){
            if(angular.isDefined(copies)){
                //sort letters by compdate
                if(copies[0].archive_copy_id == "letters") {
                    copies.sort(function(a,b){
                        if(a.source.objdescid.compdate['@value'] > b.source.objdescid.compdate['@value']){return 1;}
                        if(a.source.objdescid.compdate['@value'] < b.source.objdescid.compdate['@value']){return -1;}
                        return 0;
                    })
                }
                else if(vm.bds.work.virtual == true) {
                    copies.sort(function(a,b){
                        if(a.dbi > b.dbi){return 1;}
                        if(a.dbi < b.dbi){return -1;}
                        return 0;
                    })
                }
                //sort works with copies by copy letter
                else {
                    copies.sort(function(a,b){
                        if(a.archive_copy_id > b.archive_copy_id){return 1;}
                        if(a.archive_copy_id < b.archive_copy_id){return -1;}
                        return 0;
                    })
                }
            }
        }*/


        vm.setRows = function(){
            vm.rowCount = Math.ceil(vm.copyCount / 4);
            vm.rows = [];
            for(var i = 1; i <= vm.rowCount; i++){
                vm.rows.push(i);
            }

        }

    }

    var link = function(scope,ele,attr,vm){
        var copies = function(){return vm.bds.workCopies};
        scope.$watch(copies,function(){
            vm.copyCount = vm.bds.workCopies.length;
            //vm.sortCopies(vm.bds.workCopies);
            vm.setRows();
        })
    }

    var workCopies = function () {

        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/work-copies/workCopies.html',
            controller: controller,
            link: link,
            controllerAs: 'workCopies',
            bindToController: true
        };
    }

    angular.module('blake').directive("workCopies", workCopies);


}());
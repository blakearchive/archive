/**
 * Created by lukeluke on 1/26/16.
 */

(function(){

    var controller = function($scope,$rootScope,BlakeDataService,$window){

        var vm = this;

        $rootScope.showSubMenu = 0;

        vm.columns = {
            1:{'topOffset':'-90px'},
            2:{'topOffset':'-20px'},
            3:{'topOffset':'-90px'},
            4:{'topOffset':'-20px'},
            5:{'topOffset':'-90px'},
            6:{'topOffset':'-20px'},
        };

        $scope.$on('scroll::scroll',function(event,scroll){
            $scope.$apply(function(){
                vm.columns[1].topOffset = (-90-(scroll.offset*0.2))+'px';
                vm.columns[2].topOffset = (-20-(scroll.offset*0.4))+'px';
                vm.columns[3].topOffset = (-90-(scroll.offset*0.14))+'px';
                vm.columns[4].topOffset = (-20-(scroll.offset*0.4))+'px';
                vm.columns[5].topOffset = (-90-(scroll.offset*0.5))+'px';
                vm.columns[6].topOffset = (-20-(scroll.offset*0.3))+'px';
            })
        })

        BlakeDataService.getFeaturedWorks().then(function (results) {
            console.log(results);
            var i = 0,
                sci = 1;
            angular.forEach(results, function(value) {
                value.column = sci;
                ++i;
                if(i == 4){
                    ++sci;
                    i = 0;
                }
            });
            vm.featured_works = results;
            console.log(vm.featured_works);
        });

    }

    controller.$inject = ['$scope','$rootScope','BlakeDataService','$window'];

    angular.module('blake').controller('HomeController',controller);

}());
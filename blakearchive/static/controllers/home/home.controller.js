angular.module('blake').controller('HomeController', function($scope,$rootScope,BlakeDataService){
    var vm = this;

    $rootScope.worksNavState = true;
    $rootScope.showWorkTitle = false;
    $rootScope.help = 'home';

    if(!angular.isDefined($rootScope.persistentmode)){
        $rootScope.persistentmode = 'gallery';
    }

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
    });

    BlakeDataService.getFeaturedWorks().then(function (results) {
        let i = 0,
            sci = 1,
            used = [];
        results.forEach(value => {

            //FIXME
            if(value.title == "LaocoÃ¶n"){
                value.title = "Laocoön";
            }
            if(used.indexOf(value.bad_id) == -1){
                used.push(value.bad_id);
                value.column = sci;
                if(++i == 3){
                    ++sci;
                    i = 0;
                }
            }
        });
        vm.featured_works = results;
    });

});

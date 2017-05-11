angular.module("blake").controller("navMenu", function($scope, BlakeDataService, $sessionStorage){
    var vm = this;

    $('nav.navbar ul.navbar-nav > li.dropdown').click(function() {
        var viewport_width = $(window).width();
        var element_position = $(this).offset().left;

        $(this).find('ul.dropdown-menu').css({'width': viewport_width + 'px', 'left': '-' + element_position + 'px'});
    });
    if(angular.isUndefined($sessionStorage.menus)){
        BlakeDataService.getWorks().then(function (data) {
            vm.organizeMenus(data);
        });
    } else {
        vm.lists = $sessionStorage.menus;
        //console.log(vm.lists);
    }

    var category = function(item) {
        switch(item) {
            /*case "exhibit":
                return "exhibits";
                break;*/
            case "illbk":
                return "illuminated_books";
                break;
            case "comb":
                return "book_illustration:designed_engraved";
                break;
            case "comdes":
                return "book_illustration:designed";
                break;
            case "comeng":
                return "book_illustration:engraved";
                break;
            case "spb":
                return "prints:designed_engraved";
                break;
            case "spdes":
                return "prints:designed";
                break;
            case "speng":
                return "prints:engraved";
                break;
            case "cprint":
                return "prints:drawings";
                break;
            case "mono":
                return "drawings_paintings:monochrome";
                break;
            case "paint":
                return "drawings_paintings:paintings";
                break;
            case "pen":
            case "penink":
                return "drawings_paintings:pen";
                break;
            case "penc":
                return "drawings_paintings:pencil";
                break;
            case "wc":
                return "drawings_paintings:wc";
                break;
            case "ms":
                return "manuscripts_typo:manuscripts";
                break;
            case "ltr":
                return "manuscripts_typo:letters";
                break;
            case "te":
                return "manuscripts_typo:typographic";
                break;
            default:
                return false;
        }
    };

    vm.organizeMenus = function(data) {
        if (!data) { return; }
        // Sort before nesting
        //data.sort(function(a, b) { return a.composition_date - b.composition_date; });

        var menus = {
            illuminated_books: [],
            book_illustration: [{
                designed_engraved: [],
                designed: [],
                engraved: []
            }],
            prints: [{
                designed_engraved: [],
                designed: [],
                engraved: [],
                drawings: []
            }],
            drawings_paintings: [{
                pencil:[],
                pen:[],
                monochrome:[],
                wc:[],
                paintings: []
            }],
            manuscripts_typo: [{
                manuscripts: [],
                letters: [],
                typographic: []
            }]
            //exhibits: []
        };

        // Add to menu categories
        data.forEach(function(d) {
            var cat = category(d.medium),
                pieces;

            if(cat) {
                pieces = cat.split(/:/);

                if(menus[pieces[0]] !== undefined || menus[pieces[0]][0][pieces[1]] !== undefined) {
                    if(pieces.length === 1) {
                        menus[pieces[0]].push(d);
                    } else {
                        menus[pieces[0]][0][pieces[1]].push(d);
                    }
                }
            }
        });

        vm.lists = menus;
        //console.log(vm.lists);
        $sessionStorage.menus = menus;
    }
});

angular.module("blake").directive('navMenu', function () {
    return {
        restrict: 'EA',
        template: require('html-loader!./template.html'),
        controller: "navMenu",
        controllerAs: 'menu',
        bindToController: true,
    }
});

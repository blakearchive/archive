angular.module("blake").controller("navMenu", function($scope, BlakeDataService, $sessionStorage, $q){
    var vm = this;

    $('nav.navbar ul.navbar-nav > li.dropdown').click(function() {
        var viewport_width = $(window).width();
        var element_position = $(this).offset().left;

        $(this).find('ul.dropdown-menu').css({'width': viewport_width + 'px', 'left': '-' + element_position + 'px'});
    });
    if(angular.isUndefined($sessionStorage.menus) && angular.isUndefined($sessionStorage.allWorksAlpha) && angular.isUndefined($sessionStorage.allWorksCompDateValue)){
        // Load both works and exhibitions
        BlakeDataService.getWorks().then(function(works) {
            return BlakeDataService.getExhibits().then(function(exhibitions) {
                // Filter out BlakeWork records with medium="exhibit" to avoid duplicates
                var filteredWorks = works.filter(function(work) {
                    return work.medium !== 'exhibit';
                });
                
                // Transform exhibitions to match work structure, filtering out "Illuminating VALA"
                var transformedExhibitions = exhibitions
                    .filter(function(exhibit) {
                        return exhibit.exhibit_id !== 'illuminatingvala';  // Hide Illuminating VALA exhibition
                    })
                    .map(function(exhibit) {
                        return {
                            bad_id: exhibit.exhibit_id,  // Use exhibit_id as bad_id
                            title: exhibit.title,
                            menuTitle: exhibit.title,
                            medium: 'exhibit',
                            composition_date_string: exhibit.composition_date_string,
                            composition_date_value: exhibit.composition_date_string // Use string for sorting
                        };
                    });
                
                // Merge filtered works and exhibitions
                var allData = filteredWorks.concat(transformedExhibitions);
                
                vm.organizeMenus(allData);
                vm.alphabetizeAll(allData);
                vm.orderByCompDateAll(allData);
            });
        });
    } else {
        vm.lists = $sessionStorage.menus;
        vm.allWorksAlpha = $sessionStorage.allWorksAlpha;
        vm.allWorksCompDateValue = $sessionStorage.allWorksCompDateValue;
        //console.log(vm.lists);
    }


    var category = function(item) {
        switch(item) {
            case "exhibit":
                return "exhibits";
                break;
            case "preview":
                return "previews";
                break;
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
            case "ann":
            case "annotations":   
                return "manuscripts_typo:annotations";
                break;
            case "ms":
                return "manuscripts_typo:manuscripts";
                break;
            case "ltr":
                return "manuscripts_typo:lettersandreceipts";
                break;
            case "te":
                return "manuscripts_typo:typographic";
                break;
            default:
                return false;
        }
    };

    vm.alphabetizeAll = function(data) {

        if (!data) { return; }
        data = data.slice();
        data.forEach(function(work) {
            if (!work.menuTitle || typeof work.menuTitle !== 'string') {
                work.sortTitle = '';
                return;
            }
            work.sortTitle = work.menuTitle
                .replace(/^[\s"'“‘]+/, "")
                .replace(/^(?:a|an|the)\s+/i, "");
        });
        data.sort(function(a, b) {
            let at = a.sortTitle || '', bt = b.sortTitle || '';
            return at.localeCompare(bt, 'en', { sensitivity: 'base', ignorePunctuation: true });
        });
        vm.allWorksAlpha = data;
        $sessionStorage.allWorksAlpha = vm.allWorksAlpha;
    }

    vm.orderByCompDateAll = function(data) {
        if (!data) { return; }
        data = data.slice();
        data.sort(function(a, b) { 
            if(a.composition_date_value < b.composition_date_value) return -1;
            if(a.composition_date_value > b.composition_date_value) return 1;
            return 0;
        });

        vm.allWorksCompDateValue = data;

        console.log(vm.allWorksCompDateValue);
        $sessionStorage.allWorksCompDateValue = vm.allWorksCompDateValue;
    }

    vm.organizeMenus = function(data) {
        if (!data) { return; }
        // Sort before nesting
        data.sort(function(a, b) {
            if(a.composition_date_value < b.composition_date_value) return -1;
            if(a.composition_date_value > b.composition_date_value) return 1;
            return 0;
        });

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
                annotations: [],
                manuscripts: [],
                lettersandreceipts: [],
                typographic: []
            }],
            exhibits: [],
            previews: []
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

    if (vm.allWorksAlpha) {
        vm.alphabetizeAll(vm.allWorksAlpha);
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

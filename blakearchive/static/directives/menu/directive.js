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
                
                // Transform exhibitions to match work structure
                var transformedExhibitions = exhibitions.map(function(exhibit) {
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
        // Create a sortTitle for each work, do not mutate menuTitle
        data.forEach(function(work) {
            if (!work.menuTitle || typeof work.menuTitle !== 'string') {
                work.sortTitle = '';
                return;
            }
            let t = work.menuTitle;
            // Apply all the sorting transformations to sortTitle only
            if(t.match(/^The /)) t = t.replace(/^The /,"") + ", The";
            if(t.match(/^A /)) t = t.replace(/^A /,"") + ", A";
            if(t.match(/^An /)) t = t.replace(/^An /,"") + ", An";
            if(t.match(/^\"A Fairy leapt"/)) t = '"Fairy leapt, A"';
            if(t.match(/^Illustrations to the /)) t = t.replace(/^Illustrations to the /,"") + ", Illustrations to the";
            if(t.match(/^Illustrations to /)) t = t.replace(/^Illustrations to /,"") + ", Illustrations to";
            if(t.match(/^Preliminary Illustrations to /)) t = t.replace(/^Preliminary Illustrations to /,"") + ", Preliminary Illustrations to";
            if(t.match(/^Drawings for \"The Pastorals of Virgil"/)) t = '"Pastorals of Virgil, The", Drawings for';
            if(t.match(/^Drawings for Mary Wollstonecraft's/)) t = "Wollstonecraft's, Mary, Original Stories from Real Life, Drawings for";
            if(t.match(/^Drawings for /)) t = t.replace(/^Drawings for /,"") + ", Drawings for";
            if(t.match(/^Blake's Illustrations of /)) t = t.replace(/^Blake's Illustrations of /,"") + ", Blake's Illustrations of";
            if(t.match(/^Blake's /)) t = t.replace(/^Blake's /,"") + ", Blake's";
            if(t.match(/^Twelve Illustrations to /)) t = t.replace(/^Twelve Illustrations to /,"") + ", Twelve Illustrations to";
            if(t.match(/^William Hayley/)) t = "Hayley, William" + t.replace(/^William Hayley/,"");
            if(t.match(/^John Flaxman /)) t = "Flaxman, John" + t.replace(/^John Flaxman/,"");
            if(t.match(/^John Gabriel Stedman/)) t = "Stedman, John Gabriel" + t.replace(/^John Gabriel Stedman/,"");
            if(t.match(/^Mary Wollstonecraft/)) t = "Wollstonecraft, Mary" + t.replace(/^Mary Wollstonecraft/,"");
            if(t.match(/^Edward Young's/)) t = "Young's, Edward," + t.replace(/^Edward Young's/,"");
            if(t.match(/^Edward Young/)) t = "Young, Edward" + t.replace(/^Edward Young/,"");
            if(t.match(/^Portrait of George Romney/)) t = "Romney, George, Portrait of";
            if(t.match(/^Robert Blair's/)) t = "Blair's, Robert," + t.replace(/^Robert Blair's/,"");
            if(t.match(/^Robert Blair/)) t = "Blair, Robert" + t.replace(/^Robert Blair/,"");
            if(t.match(/^Sketches for Robert Blair's \"The Grave"/)) t = 'Blair\'s, Robert, "The Grave," Sketches for';
            work.sortTitle = t.replace(/[",']/g,"");
        });
        // Sort by sortTitle
        data.sort(function(a, b) {
            let at = a.sortTitle || '', bt = b.sortTitle || '';
            if(at < bt) return -1;
            if(at > bt) return 1;
            return 0;
        });
        vm.allWorksAlpha = data;
        $sessionStorage.allWorksAlpha = vm.allWorksAlpha;
    }

    vm.orderByCompDateAll = function(data) {
        if (!data) { return; }
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

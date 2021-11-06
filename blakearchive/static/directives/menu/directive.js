angular.module("blake").controller("navMenu", function($scope, BlakeDataService, $sessionStorage){
    var vm = this;

    $('nav.navbar ul.navbar-nav > li.dropdown').click(function() {
        var viewport_width = $(window).width();
        var element_position = $(this).offset().left;

        $(this).find('ul.dropdown-menu').css({'width': viewport_width + 'px', 'left': '-' + element_position + 'px'});
    });
    if(angular.isUndefined($sessionStorage.menus) && angular.isUndefined($sessionStorage.allWorksAlpha) && angular.isUndefined($sessionStorage.allWorksCompDateValue)){
        BlakeDataService.getWorks().then(function (data) {
            vm.organizeMenus(data);
        });
        BlakeDataService.getWorks().then(function (data2) {
            vm.alphabetizeAll(data2);
        });
        BlakeDataService.getWorks().then(function (data3) {
            vm.orderByCompDateAll(data3);
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
        data.sort(function(a, b) {
            if(a.menuTitle.match(/^The /) != null) {
                a.menuTitle = a.menuTitle.replace(/^The /,"") + ", The"
            }
            else if(b.menuTitle.match(/^The /) != null) {
                b.menuTitle = b.menuTitle.replace(/^The /,"") + ", The"
            }
            else if(a.menuTitle.match(/^A /) != null) {
                a.menuTitle = a.menuTitle.replace(/^A /,"") + ", A"
            }
            else if(b.menuTitle.match(/^A /) != null) {
                b.menuTitle = b.menuTitle.replace(/^A /,"") + ", A"
            }
            else if(a.menuTitle.match(/^An /) != null) {
                a.menuTitle = a.menuTitle.replace(/^An /,"") + ", An"
            }
            else if(b.menuTitle.match(/^An /) != null) {
                b.menuTitle = b.menuTitle.replace(/^An /,"") + ", An"
            }
            else if(a.menuTitle.match(/^Illustrations to the /) != null) {
                a.menuTitle = a.menuTitle.replace(/^Illustrations to /,"") + ", Illustrations to the"
            }
            else if(b.menuTitle.match(/^Illustrations to the /) != null) {
                b.menuTitle = b.menuTitle.replace(/^Illustrations to the /,"") + ", Illustrations to the"
            }
            else if(a.menuTitle.match(/^Illustrations to /) != null) {
                a.menuTitle = a.menuTitle.replace(/^Illustrations to /,"") + ", Illustrations to"
            }
            else if(b.menuTitle.match(/^Illustrations to /) != null) {
                b.menuTitle = b.menuTitle.replace(/^Illustrations to /,"") + ", Illustrations to"
            }
            else if(a.menuTitle.match(/^Drawings for "The Pastorals of Virgil"/) != null) {
                a.menuTitle = "\"Pastorals of Virgil, The\", Drawings for"
            }
            else if(b.menuTitle.match(/^Drawings for /) != null) {
                b.menuTitle = b.menuTitle.replace(/^Drawings for "The Pastorals of Virgil"/,"") + "\"Pastorals of Virgil, The\", Drawings for"
            }
            else if(a.menuTitle.match(/^Drawings for /) != null) {
                a.menuTitle = a.menuTitle.replace(/^Drawings for /,"") + ", Drawings for"
            }
            else if(b.menuTitle.match(/^Drawings for /) != null) {
                b.menuTitle = b.menuTitle.replace(/^Drawings for /,"") + ", Drawings for"
            }
            else if(a.menuTitle.match(/^Blake's Illustrations of /) != null) {
                a.menuTitle = a.menuTitle.replace(/^Blake's Illustrations of /,"") + ", Blake's Illustrations of"
            }
            else if(b.menuTitle.match(/^Blake's Illustrations of /) != null) {
                b.menuTitle = b.menuTitle.replace(/^Blake's Illustrations of /,"") + ", Blake's Illustrations of"
            }
            else if(a.menuTitle.match(/^Blake's /) != null) {
                a.menuTitle = a.menuTitle.replace(/^Blake's /,"") + ", Blake's"
            }
            else if(b.menuTitle.match(/^Blake's for /) != null) {
                b.menuTitle = b.menuTitle.replace(/^Blake's /,"") + ", Blake's"
            }
            else if(a.menuTitle.match(/^Twelve Illustrations to /) != null) {
                a.menuTitle = a.menuTitle.replace(/^Twelve Illustrations to /,"") + ", Twelve Illustrations to"
            }
            else if(b.menuTitle.match(/^Twelve Illustrations to /) != null) {
                b.menuTitle = b.menuTitle.replace(/^Twelve Illustrations to /,"") + ", Twelve Illustrations to"
            }
            else if(a.menuTitle.match(/^William Hayley/) != null) {
                a.menuTitle = "Hayley, William" + a.menuTitle.replace(/^William Hayley/,"")
            }
            else if(b.menuTitle.match(/^William Hayley/) != null) {
                b.menuTitle = "Hayley, William" + b.menuTitle.replace(/^William Hayley/,"")
            }
            else if(a.menuTitle.match(/^John Flaxman /) != null) {
                a.menuTitle = "Flaxman, John" + a.menuTitle.replace(/^John Flaxman/,"")
            }
            else if(b.menuTitle.match(/^John Flaxman/) != null) {
                b.menuTitle = "Flaxman, John" + b.menuTitle.replace(/^John Flaxman/,"")
            }
            else if(a.menuTitle.match(/^John Gabriel Stedman/) != null) {
                a.menuTitle = "Stedman, John Gabriel" + a.menuTitle.replace(/^John Gabriel Stedman/,"")
            }
            else if(b.menuTitle.match(/^John Gabriel Stedman/) != null) {
                b.menuTitle = "Stedman, John Gabriel" + b.menuTitle.replace(/^John Gabriel Stedman/,"")
            }
            else if(a.menuTitle.match(/^Mary Wollstonecraft/) != null) {
                a.menuTitle = "Wollstonecraft, Mary" + a.menuTitle.replace(/^Mary Wollstonecraft/,"")
            }
            else if(b.menuTitle.match(/^Mary Wollstonecraft/) != null) {
                b.menuTitle = "Wollstonecraft, Mary" + b.menuTitle.replace(/^Mary Wollstonecraft/,"")
            }
            else if(a.menuTitle.match(/^Edward Young/) != null) {
                a.menuTitle = "Young, Edward" + a.menuTitle.replace(/^Edward Young/,"")
            }
            else if(b.menuTitle.match(/^Edward Young/) != null) {
                b.menuTitle = "Young, Edward" + b.menuTitle.replace(/^Edward Young/,"")
            }
            else if(a.menuTitle.match(/^Portrait of George Romney/) != null) {
                a.menuTitle = "Romney, George, Portrait of"
            }
            else if(b.menuTitle.match(/^Portrait of George Romney/) != null) {
                b.menuTitle = "Romney, George, Portrait of"
            }
            else if(a.menuTitle.match(/^Robert Blair/) != null) {
                a.menuTitle = "Blair, Robert" + a.menuTitle.replace(/^Robert Blair/,"")
            }
            else if(b.menuTitle.match(/^Robert Blair/) != null) {
                b.menuTitle = "Blair, Robert" + b.menuTitle.replace(/^Robert Blair/,"")
            }
            else if(a.menuTitle.match(/^Sketches for Robert Blair's "The Grave"/) != null) {
                a.menuTitle = "\"Blair's, Robert\", \"The Grave,\" Sketches for"
            }
            else if(b.menuTitle.match(/^Sketches for Robert Blair's "The Grave"/) != null) {
                b.menuTitle = "\"Blair's, Robert\", \"The Grave,\" Sketches for"
            }
            if(a.menuTitle.replace(/"/g,"") < b.menuTitle.replace(/"/g,"")) return -1;
            if(a.menuTitle.replace(/"/g,"") > b.menuTitle.replace(/"/g,"")) return 1;
            return 0;
        });
        
        vm.allWorksAlpha = data;
        console.log(vm.allWorksAlpha);
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

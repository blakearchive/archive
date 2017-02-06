angular.module("blake").factory("SearchService", function ($rootScope, $location, $q, BlakeDataService) {
    let s = {};

    s.selectedWork = -1;
    s.selectedCopy = 0;
    s.selectedObject = 0;
    
        s.queryString = '';
    s.noresults = false;
    s.objectResults = [];
    s.copyResults = [];
    s.workResults = [];

    s.stop_words = ["a",
        "about",
        "above",
        "after",
        "again",
        "against",
        "all",
        "am",
        "an",
        "and",
        "any",
        "are",
        "aren't",
        "as",
        "at",
        "be",
        "because",
        "been",
        "before",
        "being",
        "below",
        "between",
        "both",
        "but",
        "by",
        "can't",
        "cannot",
        "could",
        "couldn't",
        "did",
        "didn't",
        "do",
        "does",
        "doesn't",
        "doing",
        "don't",
        "down",
        "during",
        "each",
        "few",
        "for",
        "from",
        "further",
        "had",
        "hadn't",
        "has",
        "hasn't",
        "have",
        "haven't",
        "having",
        "he",
        "he'd",
        "he'll",
        "he's",
        "her",
        "here",
        "here's",
        "hers",
        "herself",
        "him",
        "himself",
        "his",
        "how",
        "how's",
        "i",
        "i'd",
        "i'll",
        "i'm",
        "i've",
        "if",
        "in",
        "into",
        "is",
        "isn't",
        "it",
        "it's",
        "its",
        "itself",
        "let's",
        "me",
        "more",
        "most",
        "mustn't",
        "my",
        "myself",
        "no",
        "nor",
        "not",
        "of",
        "off",
        "on",
        "once",
        "only",
        "or",
        "other",
        "ought",
        "our",
        "ours   ",
        "ourselves",
        "out",
        "over",
        "own",
        "same",
        "shan't",
        "she",
        "she'd",
        "she'll",
        "she's",
        "should",
        "shouldn't",
        "so",
        "some",
        "such",
        "than",
        "that",
        "that's",
        "the",
        "their",
        "theirs",
        "them",
        "themselves",
        "then",
        "there",
        "there's",
        "these",
        "they",
        "they'd",
        "they'll",
        "they're",
        "they've",
        "this",
        "those",
        "through",
        "to",
        "too",
        "under",
        "until",
        "up",
        "very",
        "was",
        "wasn't",
        "we",
        "we'd",
        "we'll",
        "we're",
        "we've",
        "were",
        "weren't",
        "what",
        "what's",
        "when",
        "when's",
        "where",
        "where's",
        "which",
        "while",
        "who",
        "who's",
        "whom",
        "why",
        "why's",
        "with",
        "won't",
        "would",
        "wouldn't",
        "you",
        "you'd",
        "you'll",
        "you're",
        "you've",
        "your",
        "yours",
        "yourself",
        "yourselves"];

    s.search = function () {
        let objectSearch = BlakeDataService.queryObjects(s.searchConfig),
            copySearch = BlakeDataService.queryCopies(s.searchConfig),
            workSearch = BlakeDataService.queryWorks(s.searchConfig);
        return $q.all([objectSearch,copySearch,workSearch]).then(function(results){
            s.objectResults = results[0];
            angular.forEach(s.objectResults, function(works,type){
                angular.forEach(works, function(work,index){
                    BlakeDataService.getObject(s.objectResults[type][index][2][0][2][0][0]).then(function (results) {
                        s.objectResults[type][index][2][0][2][0][0] = results;
                    });
                });
            });
            s.copyResults = results[1];
            console.log(s.copyResults);
            angular.forEach(s.copyResults, function(works,type){
                angular.forEach(works, function(work,index){
                    //s.populateWorkCopies(type,index);
                    BlakeDataService.getCopy(s.copyResults[type][index][2][0][0]).then(function (results) {
                        s.copyResults[type][index][2][0][0] = results;
                    });
                });
            });
            s.workResults = results[2];
            angular.forEach(s.workResults, function(results,type){
                let arrayedResults = [];
                angular.forEach(results.results,function(work){
                    let array = [work,1];
                    arrayedResults.push(array);
                });
                s.workResults[type] = arrayedResults;
            });
            $rootScope.$broadcast('searchCtrl::newSearch');
        });

    };

    s.loadSearchPage = function () {
        if(s.searchConfig.searchString != null) {
            $location.url(directoryPrefix + "/search?search=" + encodeURIComponent(s.searchConfig.searchString));
        }
    };

    s.searchConfig = {
        useCompDate: true,
        usePrintDate: false,
        searchAllFields: true,
        searchTitle: false,
        searchText: false,
        searchNotes: false,
        searchImageDescriptions: false,
        searchImageKeywords: false,
        searchWorks: false,
        searchCopies: false,
        searchAllTypes: true,
        searchIlluminatedBooks: false,
        searchCommercialBookIllustrations: false,
        searchSeparatePrints: false,
        searchDrawingsPaintings: false,
        searchManuscripts: false,
        searchRelatedMaterials: false,
        minDate: 1772,
        maxDate: 1827
    };
    
    s.populateTree = function (index) {
        let copyBads = [],
            copyBadMap = {},
            objectIds = [],
            objectIdMap = {};

        if (angular.isArray(s.resultTree[index][2])){

            s.resultTree[index][2].forEach(function (copyResults,copyKey) {
                if (typeof copyResults[0] === "string") {
                    copyBads.push(copyResults[0]);
                    // We're storing a map from bad_id to its results container to simplify updating the results
                    // with retrieved copies.
                    copyBadMap[copyResults[0]] = copyResults;

                    if(angular.isArray(s.resultTree[index][2][copyKey][2])){

                        s.resultTree[index][2][copyKey][2].forEach(function (objResults) {
                            objectIds.push(objResults[0]);
                            // We're storing a map from bad_id to its results container to simplify updating the results
                            // with retrieved copies.
                            objectIdMap[objResults[0]] = objResults;
                        });

                    }
                }
            });
        }

        if (copyBads.length > 0) {
            BlakeDataService.getCopies(copyBads).then(function (results) {
                results.forEach(function (result) {
                    // Doing an in-place substitution of the bad_id with the relevant object
                    copyBadMap[result.bad_id][0] = result;
                });
                if(angular.isArray(s.resultTree[index][2])){
                    s.resultTree[index][2].sort(function(a,b){
                        console.log('is '+ a[0].print_date+' > '+ b[0].print_date);
                        if(a[0].print_date > b[0].print_date){
                            return 1
                        }
                        if(a[0].print_date < b[0].print_date){
                            return -1
                        }
                        return 0
                    })
                }
            });
        }
        if (objectIds.length > 0) {
            BlakeDataService.getObjects(objectIds).then(function (results) {
                results.forEach(function (result) {
                    // Doing an in-place substitution of the bad_id with the relevant object
                    objectIdMap[result.desc_id][0] = result;
                });
            });
        }
        // Sort the copies
    };

    s.showHighlight = function(objectIndex,virtualCopyIndex){
        s.selectedObject = objectIndex;
        if(s.tree == 'copy'){
            s.selectedCopy = objectIndex;
        }
        if(virtualCopyIndex){
            s.selectedCopy = virtualCopyIndex;
        }
    };
    
    s.getHandprintDescription = function(workIndex,label){
        switch(s.tree){
            case 'work':
                return '<strong>' + s.resultTree[workIndex][0].title + ' (' + 'Composed ' + s.resultTree[workIndex][0].composition_date_string + ')' + '</strong>';
            default:
                let string = '<strong>'+s.resultTree[workIndex][0].title+' (' + 'Composed ' + s.resultTree[workIndex][0].composition_date_string + ')'+'</strong><br>',
                    endstring = '';

                if(label == 'Copy Information') {
                    if(s.resultTree[workIndex][2].length > 1 && !s.resultTree[workIndex][0].virtual){
                        string += '(' + s.resultTree[workIndex][2].length+ ' Copies' + ')';
                    }
                    if(s.resultTree[workIndex][2].length == 1 && !s.resultTree[workIndex][0].virtual){
                        string += '(' + s.resultTree[workIndex][2].length+ ' Copy' + ')';
                    }
                    return string;
                }

                if(s.resultTree[workIndex][1] > 1){
                    string += '('+s.resultTree[workIndex][1] + ' Objects';
                    endstring = ')';
                }
                if(s.resultTree[workIndex][1] == 1){
                    string += '('+s.resultTree[workIndex][1] + ' Object';
                    endstring = ')';
                }
                if(s.resultTree[workIndex][2].length > 1 && !s.resultTree[workIndex][0].virtual){
                    string += ' across '+s.resultTree[workIndex][2].length+ ' Copies';
                }
                if(s.resultTree[workIndex][2].length == 1 && !s.resultTree[workIndex][0].virtual){
                    string += ' across '+s.resultTree[workIndex][2].length+ ' Copy';
                }

                string += endstring;

                return string;
        }
    };
    
    s.getPreviewHref = function(){
        if(s.selectedWork == -1){
            return;
        }
        switch(s.tree){
            case 'object':
                let work = s.resultTree[s.selectedWork][0],
                    copyBad = work.virtual ? work.bad_id : s.resultTree[s.selectedWork][2][s.selectedCopy][0].bad_id,
                    descId = s.resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].desc_id;
                return copyBad+'?descId='+descId;
            case 'copy':
                return s.resultTree[s.selectedWork][2][s.selectedCopy][0].bad_id;
            case 'work':
                return
        }
    };

    s.getPreviewImage = function(){
        if(s.selectedWork == -1){
            return;
        }
        switch(s.tree){
            case 'object':
                return s.resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].dbi;
            case 'copy':
                return s.resultTree[s.selectedWork][2][s.selectedCopy][0].image;
            case 'work':
                return
        }
    };

    s.getWorkImage = function(workIndex){
            switch(s.tree){
                case 'object':
                    if(angular.isDefined(s.resultTree[workIndex][2][0][2][0][0])){
                        return s.resultTree[workIndex][2][0][2][0][0].dbi + '.100.jpg';
                    }
                case 'copy':
                    return s.resultTree[workIndex][2][0][0].image + '.100.jpg';
                case 'work':
                    return s.resultTree[workIndex][0].image;
        }
    };

    s.getPreviewLabel = function(){
        if(s.selectedWork == -1){
            return;
        }
        switch(s.tree){
            case 'object':
                return s.resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].full_object_id;
            case 'copy':
                return 'Copy '+s.resultTree[s.selectedWork][2][s.selectedCopy][0].archive_copy_id;
            case 'work':
                return
        }
    };
    
    s.showCopies = function(workIndex){
        s.selectedCopy = 0;
        s.selectedObject = 0;
        s.populateTree(workIndex);
        s.selectedWork = workIndex;
        $rootScope.$broadcast('searchResultDirective::showCopies',{type:s.type});
        $rootScope.$broadcast('searchCtrl::changeResult',{type:s.type,objectIndex:s.selectedWork});
    };

    s.showObjects = function(copyIndex){
        s.selectedCopy = copyIndex;
    };

    s.getPreviewTitle = function(){
         if(s.selectedWork == -1){
            return;
        }
        switch(s.tree){
            case 'object':
                return s.resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].title
        }
    };

    s.nextResult = function(){
        if(s.s.selectedWork + 1 < s.s.resultTree.length){
            s.s.selectedWork += 1;
            s.s.selectedCopy = 0;
            s.s.selectedObject = 0;
            s.s.populateTree(s.s.selectedWork);
            $rootScope.$broadcast('searchCtrl::changeResult',{type:s.type,objectIndex:s.selectedWork})
        }
    };

    s.previousResult = function(){
        if(s.selectedWork > 0){
            s.selectedWork -= 1;
            s.selectedCopy = 0;
            s.selectedObject = 0;
            s.populateTree(s.selectedWork);
            $rootScope.$broadcast('searchCtrl::changeResult',{type:s.type,objectIndex:s.selectedWork})
        }
    };
    
    s.closeCopies = function(resultType){
        s.types.object[resultType].showCopies = false;
        s.types.object[resultType].selectedWork = -1;
        s.types.object[resultType].selectedCopy = -1;
        s.types.object[resultType].selectedObject = -1;
    };
    
    s.showCopiesHandler = function(e,d){
        if(d.type !== s.type){
            s.selectedWork = -1;
        }
    };
    
    return s;
});
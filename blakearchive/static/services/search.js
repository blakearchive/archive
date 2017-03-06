angular.module("blake").factory("SearchService", function ($rootScope, $location, $q, BlakeDataService, directoryPrefix) {
    let s = {};

    s.selectedWork = -1;
    s.selectedCopy = 0;
    s.selectedObject = 0;
    s.searching = false;
    s.queryString = '';

    s.resetResults = function () {
        s.objectResults = [];
        s.copyResults = [];
        s.workResults = [];
    };

    s.resetResults();

    s.stopWords = ["a",
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
        delete s.type;
        s.queryString = s.searchConfig.searchString;
        s.highlight = s.searchConfig.searchString;
        s.resetResults();
        if (s.searchConfig.searchString == "") return;
        s.resetResults();
        s.searching = true;
        s.highlight = s.searchConfig.searchString;
        let objectSearch = BlakeDataService.queryObjects(s.searchConfig),
            copySearch = BlakeDataService.queryCopies(s.searchConfig),
            workSearch = BlakeDataService.queryWorks(s.searchConfig);
        return $q.all([objectSearch,copySearch,workSearch]).then(function(results){
            s.objectResults = results[0];
            for (let type in s.objectResults) {
                let works = s.objectResults[type];
                works.forEach((work,index) =>{
                    BlakeDataService.getObject(s.objectResults[type][index][2][0][2][0][0]).then(results => {
                        s.objectResults[type][index][2][0][2][0][0] = results;
                    });
                });
            }
            s.copyResults = results[1];
            console.log(s.copyResults);
            for (let type in s.copyResults) {
                let works = s.copyResults[type];
                works.forEach((work,index) => {
                    //s.populateWorkCopies(type,index);
                    BlakeDataService.getCopy(s.copyResults[type][index][2][0][0]).then(results => {
                        s.copyResults[type][index][2][0][0] = results;
                    });
                });
            }
            s.workResults = results[2];
            for (let type in s.workResults) {
                let results = s.workResults[type], arrayedResults = [];
                results.results.forEach(work => {
                    let array = [work,1];
                    arrayedResults.push(array);
                });
                s.workResults[type] = arrayedResults;
            }
            $rootScope.$broadcast('searchCtrl::newSearch');
            s.searching = false;
        });
    };

    s.hasObjectResults = function () {
        return s.objectResults && (
            s.objectResults['title'] && s.objectResults['title'].length != 0 ||
            s.objectResults['tag'] && s.objectResults['tag'].length != 0 ||
            s.objectResults['notes'] && s.objectResults['notes'].length != 0 ||
            s.objectResults['text'] && s.objectResults['text'].length != 0 ||
            s.objectResults['text'] && s.objectResults['description'].length != 0)
    };

    s.hasCopyResults = function () {
        return s.copyResults && s.copyResults['copy-info'] && s.copyResults['copy-info'].length != 0;
    };

    s.hasWorkResults = function () {
        return s.workResults && s.workResults['info'] && s.workResults['info'].length != 0;
    };

    s.hasResults = function () {
        return (
            s.hasObjectResults() ||
            s.hasCopyResults() ||
            s.hasWorkResults()
        );
    };

    s.loadSearchPage = function () {
        if (s.searchConfig.searchString != null) {
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
        searchCopyInformation: false,
        searchSeparatePrints: false,
        searchDrawingsPaintings: false,
        searchManuscripts: false,
        searchRelatedMaterials: false,
        minDate: 1772,
        maxDate: 1827
    };

    s.searchFields = ['searchTitle','searchText','searchNotes','searchImageDescriptions','searchImageKeywords','searchWorks','searchCopies'];

    s.searchTypes = ['searchIlluminatedBooks','searchCommercialBookIllustrations','searchSeparatePrints','searchDrawingsPaintings','searchManuscripts','searchRelatedMaterials'];

    s.removeStopWords = function () {
        if (!s.searchConfig.searchString.match(/\".*\"/g)) {
            for (let x = 0; x < s.stopWords.length; x++) {
                let re1 = new RegExp('\\s' + s.stopWords[x] + '\\s', "g");
                let re2 = new RegExp('^' + s.stopWords[x] + '\\s', "g");
                let re3 = new RegExp('\\s' + s.stopWords[x] + '$', "g");
                let re4 = new RegExp('^' + s.stopWords[x] + '$', "g");
                s.searchConfig.searchString = s.searchConfig.searchString.replace(re1, " ");
                s.searchConfig.searchString = s.searchConfig.searchString.replace(re2, "");
                s.searchConfig.searchString = s.searchConfig.searchString.replace(re3, "");
                s.searchConfig.searchString = s.searchConfig.searchString.replace(re4, "");
            }
            s.searchConfig.searchString = s.searchConfig.searchString.replace(/\s\s*/g, " ");
        }
    };
    
    s.changeType = function(){
        let check = 0;
        s.searchTypes.forEach(type => {
            if (s.searchConfig[type]) {
                check++;
            }
        });
        s.searchConfig.searchAllTypes = check <= 0;
        s.search();
    };

    s.allTypes = function(){
        if (s.searchConfig.searchAllTypes) {
            s.types.forEach(type => s.searchConfig[type] = false);
        }
        s.search();
    };

    s.changeField = function(){
        let check = 0;
        s.searchFields.forEach(field => {
            if (s.searchConfig[field]) {
                check++;
            }
        });
        s.searchConfig.searchAllFields = check <= 0;
    };

    s.allFields = function(){
        if (s.searchConfig.searchAllFields) {
            s.searchFields.forEach(field => s.searchConfig[field] = false);
        }
    };
    
    s.populateTree = function (resultTree, index) {
        let copyBads = [],
            copyBadMap = {},
            objectIds = [],
            objectIdMap = {};

        if (Array.isArray(resultTree[index][2])){

            resultTree[index][2].forEach((copyResults,copyKey) => {
                if (typeof copyResults[0] === "string") {
                    copyBads.push(copyResults[0]);
                    // We're storing a map from bad_id to its results container to simplify updating the results
                    // with retrieved copies.
                    copyBadMap[copyResults[0]] = copyResults;

                    if(Array.isArray(resultTree[index][2][copyKey][2])){

                        resultTree[index][2][copyKey][2].forEach(objResults => {
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
                if(Array.isArray(resultTree[index][2])){
                    resultTree[index][2].sort(function(a,b){
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

    s.showHighlight = function(tree, objectIndex, virtualCopyIndex){
        s.selectedObject = objectIndex;
        if(tree == 'copy'){
            s.selectedCopy = objectIndex;
        }
        if(virtualCopyIndex){
            s.selectedCopy = virtualCopyIndex;
        }
    };
    
    s.getHandprintDescription = function(tree, results, workIndex,label){
        switch (tree) {
            case 'work':
                return `<strong>${results[workIndex][0].title} (Composed ${results[workIndex][0].composition_date_string})</strong>`;
            default:
                let string = `<strong>${results[workIndex][0].title} (Composed ${results[workIndex][0].composition_date_string})</strong><br>`,
                    endstring = '';

                if(label == 'Copy Information') {
                    if(results[workIndex][2].length > 1 && !results[workIndex][0].virtual){
                        string += '(' + results[workIndex][2].length+ ' Copies' + ')';
                    }
                    if(results[workIndex][2].length == 1 && !results[workIndex][0].virtual){
                        string += '(' + results[workIndex][2].length+ ' Copy' + ')';
                    }
                    return string;
                }

                if(results[workIndex][1] > 1){
                    string += '('+results[workIndex][1] + ' Objects';
                    endstring = ')';
                }
                if(results[workIndex][1] == 1){
                    string += '('+results[workIndex][1] + ' Object';
                    endstring = ')';
                }
                if(results[workIndex][2].length > 1 && !results[workIndex][0].virtual){
                    string += ' across '+results[workIndex][2].length+ ' Copies';
                }
                if(results[workIndex][2].length == 1 && !results[workIndex][0].virtual){
                    string += ' across '+results[workIndex][2].length+ ' Copy';
                }

                string += endstring;

                return string;
        }
    };
    
    s.getPreviewHref = function (tree, resultTree) {
        try {
            switch (tree) {
                case 'object':
                    let work = resultTree[s.selectedWork][0],
                        copyBad = work.virtual ? work.bad_id : resultTree[s.selectedWork][2][s.selectedCopy][0].bad_id,
                        descId = resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].desc_id;
                    return copyBad + '?descId=' + descId;
                case 'copy':
                    return resultTree[s.selectedWork][2][s.selectedCopy][0].bad_id;
            }
        } catch (e) {}
    };

    s.getPreviewImage = function(tree, resultTree){
        try {
            switch (tree) {
                case 'object':
                    return resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].dbi;
                case 'copy':
                    return resultTree[s.selectedWork][2][s.selectedCopy][0].image;
            }
        } catch (e) {}
    };

    s.getWorkImage = function(tree, resultTree, workIndex){
        try {
            switch(tree) {
                case 'object':
                    if (angular.isDefined(resultTree[workIndex][2][0][2][0][0])) {
                        return resultTree[workIndex][2][0][2][0][0].dbi + '.100.jpg';
                    }
                case 'copy':
                    return resultTree[workIndex][2][0][0].image + '.100.jpg';
                case 'work':
                    return resultTree[workIndex][0].image;
            }
        } catch (e) {}
    };

    s.getPreviewLabel = function (tree, resultTree) {
        try {
            switch (tree) {
                case 'object':
                    return resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].full_object_id;
                case 'copy':
                    return 'Copy ' + resultTree[s.selectedWork][2][s.selectedCopy][0].archive_copy_id;
            }
        } catch (e) {}
    };
    
    s.showCopies = function(type, results, workIndex){
        s.selectedCopy = 0;
        s.selectedObject = 0;
        s.populateTree(results, workIndex);
        s.selectedWork = workIndex;
        s.type = type;
        // $rootScope.$broadcast('searchResultDirective::showCopies', {type: type});
        $rootScope.$broadcast('searchCtrl::changeResult', {type: type, objectIndex: s.selectedWork});
    };

    s.showObjects = function(copyIndex){
        s.selectedCopy = copyIndex;
    };

    s.getPreviewTitle = function (tree, resultTree){
        try {
            if (tree == 'object') {
                return resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].title
            }
        } catch (e) {}
    };

    s.nextResult = function(type, resultTree){
        if (s.selectedWork + 1 < resultTree.length){
            s.selectedWork += 1;
            s.selectedCopy = 0;
            s.selectedObject = 0;
            s.populateTree(resultTree, s.selectedWork);
            $rootScope.$broadcast('searchCtrl::changeResult',{type: type, objectIndex:s.selectedWork})
        }
    };

    s.previousResult = function(type, resultTree){
        if (s.selectedWork > 0){
            s.selectedWork -= 1;
            s.selectedCopy = 0;
            s.selectedObject = 0;
            s.populateTree(resultTree, s.selectedWork);
            $rootScope.$broadcast('searchCtrl::changeResult',{type: type, objectIndex: s.selectedWork})
        }
    };
    
    s.closeCopies = function(){
        s.selectedWork = -1;
    };
    
    return s;
});
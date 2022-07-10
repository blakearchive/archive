angular.module("blake").factory("SearchService", function (worktitleService, lightbox_service, $rootScope, $location, $q, BlakeDataService, directoryPrefix) {
    let s = {};

    s.selectedWork = -1;
    s.selectedCopy = 0;
    s.selectedObject = 0;
    s.searching = false;
    s.queryString = '';
    s.searchingFromFilter = false;
    s.persistingQueryString = '';

    s.types = ['searchIlluminatedBooks','searchCommercialBookIllustrations','searchSeparatePrints','searchDrawingsPaintings','searchManuscripts','searchRelatedMaterials']

    s.wts = worktitleService;
    s.rs = $rootScope;
    let svc = {};
    svc.bds = BlakeDataService;

    s.resetResults = function () {
        s.objectResults = [];
        s.copyResults = [];
        s.workResults = [];
    };

    s.resetFilters = function () {
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
    }

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
        //this if/else uses persistingQueryString as a persisting variable so that a user can clear
        //the search box but still modify the filters for the original query
        if(!s.searchingFromFilter) {
            s.queryString = s.searchConfig.searchString;
            s.persistingQueryString = s.queryString;
            s.searchConfig.searchAllTypes = true;
            s.searchConfig.searchAllFields = true;
            s.searchConfig.minDate = 1772;
            s.searchConfig.maxDate = 1827;
            s.searchConfig.useCompDate = true;
            s.searchConfig.usePrintDate = false;
            s.allFields();
            s.allTypes();
        }
        else {
            s.queryString = s.searchConfig.searchString;
            s.searchConfig.searchString = s.persistingQueryString;
            //s.queryString = s.searchConfig.searchString;
        }
        //console.log(s.searchConfig.searchString);
        s.highlight = s.searchConfig.searchString;
        s.resetResults();
        //if (s.searchConfig.searchString == "") {
        //    searchingFromFilter = false;
        //    return;
        //}
        s.resetResults();
        s.searching = true;
        let objectSearch = BlakeDataService.queryObjects(s.searchConfig),
            copySearch = BlakeDataService.queryCopies(s.searchConfig),
            workSearch = BlakeDataService.queryWorks(s.searchConfig);
        return $q.all([objectSearch,copySearch,workSearch]).then(function(results){
            s.objectResults = results[0];
            console.log(s.objectResults);
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
            s.searchingFromFilter = false;
            s.searching = false;
        });
    };

    s.hasObjectResults = function () {
        return s.objectResults && (
            s.objectResults['title'] && s.objectResults['title'].length != 0 ||
            s.objectResults['tag'] && s.objectResults['tag'].length != 0 ||
            s.objectResults['notes'] && s.objectResults['notes'].length != 0 ||
            s.objectResults['text'] && s.objectResults['text'].length != 0 ||
            s.objectResults['text'] && s.objectResults['description'].length != 0 ||
            s.objectResults['source'] && s.objectResults['source'].length != 0);
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
        searchWorkInformation: false,
        searchCopyInformation: false,
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

    s.searchFields = ['searchTitle','searchText','searchNotes','searchImageDescriptions','searchImageKeywords','searchWorkInformation','searchCopyInformation'];

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
        s.searchingFromFilter = true;
        s.search();
    };

    s.allTypes = function(){
        if (s.searchConfig.searchAllTypes) {
            s.searchTypes.forEach(type => s.searchConfig[type] = false);
        }
        s.searchingFromFilter = true;
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


                if(label == 'Copy/Set/Receipt/Work in Preview Information') {
                    if(results[workIndex][2].length > 1 && !results[workIndex][0].virtual){
                        string += '(' + results[workIndex][2].length+ ' Copies/Sets' + ')';
                    }
                    if(results[workIndex][2].length == 1 && !results[workIndex][0].virtual){
                        string += '(' + results[workIndex][2].length+ ' Copy/Set/Receipt/Work in Preview' + ')';

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
                    string += ' across '+results[workIndex][2].length+ ' Copies/Sets';
                }
                if(results[workIndex][2].length == 1 && !results[workIndex][0].virtual){
                    string += ' across '+results[workIndex][2].length+ ' Copy/Set/Receipt/Work in Preview';

                }

                string += endstring;

                return string;
        }
    };
/*
    s.getCopyOrPreview = function (tree, resultTree) {
        let work = resultTree[s.selectedWork][0];
        if (work.image == "preview") {
            return "preview";
        }
        else {return "copy";}
               
    }
*/    
    s.getPreviewHref = function (tree, resultTree) {
        try {
            switch (tree) {
                case 'object':
                    let work = resultTree[s.selectedWork][0],
                        copyBad = work.virtual || (work.image == "preview") ? work.bad_id : resultTree[s.selectedWork][2][s.selectedCopy][0].bad_id,
                        descId = resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].desc_id;
                    if(work.image != "preview") {
                        return 'copy/' + copyBad + '?descId=' + descId;
                    } else {return 'preview/' + copyBad + '?descId=' + descId;}
                case 'copy':
                    let work2 = resultTree[s.selectedWork][0];
                    if(work2.image != "preview") {
                        return 'copy/' + resultTree[s.selectedWork][2][s.selectedCopy][0].bad_id;
                    } else {return 'preview/' + work2.bad_id;}
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

    s.addToLightBox = function(tree, resultTree){
      //console.log("===> adding: "+JSON.stringify(vm.bds.object));
      var item = {};
      item.url = "/images/"+resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].dbi+".300.jpg";
      //svc.bds.setSelectedObject(resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0]);
            console.log(resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0]);

      if(resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].copy_print_date) {
        if(resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].virutalwork_title) {
            item.title = resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].virtualwork_title + " (Printed " + resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].copy_print_date + ")";
        }
        else {
            item.title = resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].copy_title + " (Printed " + resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].copy_print_date + ")";
        }
      }
      else {
        if(resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].virtualwork_title) {
            item.title = resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].virtualwork_title + " (Composed " + resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].copy_composition_date + ")";
        }
        else {
            item.title = resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].copy_title + " (Composed " + resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].copy_composition_date + ")";
        }
      }
      item.caption = "";
      var obj = resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0];
    /*
    <span ng-if="svc.bds.work.virtual && svc.bds.copy.bad_id != 'letters'"><span>{{ svc.bds.object.title }}, </span><span class="object-no">Object {{ svc.bds.object.object_number }}, {{svc.bds.object.source.objdescid.compdate['#text']}}, {{svc.bds.object.source.repository.institution['#text']}}, </span></span>
    <span ng-if="svc.bds.work.virtual && svc.bds.copy.bad_id == 'letters'"><span>{{ svc.bds.object.title }}, </span><span class="object-no">Object {{ svc.bds.object.object_number }}, </span></span>
    */
    if (resultTree[s.selectedWork][2][s.selectedCopy][2][s.selectedObject][0].virtualwork_title){
      item.caption += obj.title +", Object "+obj.object_number;
      if (obj.copy_bad_id != 'letters' && obj.copy_bad_id != 'shakespearewc'){
        item.caption += ", "+obj.source.objdescid.compdate['#text']+", "+obj.source.repository.institution['#text'];
      }
    }else{
      /*<span class="object-no" ng-if="!svc.bds.work.virtual && !svc.bds.object.title">{{ svc.bds.object.full_object_id }}, </span>
      <span class="object-no" ng-if="!svc.bds.work.virtual && svc.bds.object.title && svc.bds.work.medium != 'exhibit'">{{svc.bds.object.title}}, {{ svc.bds.object.full_object_id }}, </span>
      <span class="object-no" ng-if="!svc.bds.work.virtual && svc.bds.object.title && svc.bds.work.medium == 'exhibit'">{{svc.bds.object.title}}</span>
      <span ng-if="svc.bds.work.medium != 'exhibit'">{{ svc.bds.object.physical_description.objsize['#text'] }} </span>
      */
      if (!obj.title){
        item.caption += obj.full_object_id;
      }else{
          item.caption += obj.title +", "+obj.full_object_id;
      }
        item.caption += ", " + obj.physical_description.objsize['#text'];
    }


      //CartStorageService.insert(item);
      lightbox_service.addToCart(item);

      // updates vm.rs so that cart counter is updated
      lightbox_service.listCartItems().then(function(data){
        s.rs.cartItems = data;
        //console.log("===== "+JSON.stringify($rootScope.cartItems));
      });

    };

    s.getWorkImage = function(tree, resultTree, workIndex){
        try {
            switch(tree) {
                case 'object':
                    if (angular.isDefined(resultTree[workIndex][2][0][2][0][0])) {
                        return resultTree[workIndex][2][0][2][0][0].dbi + '.100.jpg';
                    }
                case 'copy':
                    console.log(resultTree[workIndex]);
                    if resultTree[workIndex][0].virtual == true:
                        return resultTree[workIndex][0].image;
                    else:
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
                    if(resultTree[s.selectedWork][2][s.selectedCopy][0].archive_set_id != null) {
                        return resultTree[s.selectedWork][2][s.selectedCopy][0].archive_set_id;
                    } else if(resultTree[s.selectedWork][0].bad_id != "bb134") {
                        return 'Copy ' + resultTree[s.selectedWork][2][s.selectedCopy][0].archive_copy_id;
                    } else if(resultTree[s.selectedWork][0].bad_id == "bb134") {
                        return 'Receipt ' + resultTree[s.selectedWork][2][s.selectedCopy][0].archive_copy_id;
                    }

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
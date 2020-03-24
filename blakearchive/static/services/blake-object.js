angular.module("blake").factory("BlakeObject", function (GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeObject.
     *
     * @param config
     */

    const parseObjectLines = (object, array, type, colnum) => {
        if (Array.isArray(object)) {
            angular.forEach(object, function (objectSet, lineKey) {
                if (Array.isArray(objectSet.l)) {
                    angular.forEach(objectSet.l, function (v, k) {
                        var indent = angular.isDefined(v['@indent']) ? v['@indent'] : 0;
                        array.push({
                            'indent': indent,
                            'text': v['#text'],
                            'lineNum': v['@n'],
                            'justify': v['@justify'],
                            'type': type,
                            'colnum': colnum
                        })
                    });
                } else {
                    var indent = angular.isDefined(objectSet.l['@indent']) ? objectSet.l['@indent'] : 0;

                    if (angular.isDefined(objectSet.l.physnumber)) {
                        array.push({
                            'indent': indent,
                            'text': objectSet.l.physnumber['#text'],
                            'lineNum': objectSet.l['@n'],
                            'justify': objectSet.l['@justify'],
                            'type': type,
                            'colnum': colnum
                        });
                    } else if (angular.isDefined(objectSet.l.catchword)) {
                        array.push({
                            'indent': indent,
                            'text': objectSet.l.catchword['#text'],
                            'lineNum': objectSet.l['@n'],
                            'justify': objectSet.l['@justify'],
                            'type': type,
                            'colnum': colnum
                        });
                    } else {
                        array.push({
                            'indent': indent,
                            'text': objectSet.l['#text'],
                            'lineNum': objectSet.l['@n'],
                            'justify': objectSet.l['@justify'],
                            'type': type,
                            'colnum': colnum
                        });
                    }
                }
            });
        } else if (Array.isArray(object.l)) {
            angular.forEach(object.l, function (v, k) {
                var indent = angular.isDefined(v['@indent']) ? v['@indent'] : 0;
                array.push({
                    'indent': indent,
                    'text': v['#text'],
                    'lineNum': v['@n'],
                    'justify': v['@justify'],
                    'type': type,
                    'colnum': colnum
                });
            });
        } else {
            var indent = angular.isDefined(object.l['@indent']) ? object.l['@indent'] : 0;

            if (angular.isDefined(object.l.physnumber)) {
                array.push({
                    'indent': indent,
                    'text': object.l.physnumber['#text'],
                    'lineNum': object.l['@n'],
                    'justify': object.l['@justify'],
                    'type': type,
                    'colnum': colnum
                });
            } else if (angular.isDefined(object.l.catchword)) {
                array.push({
                    'indent': indent,
                    'text': object.l.catchword['#text'],
                    'lineNum': object.l['@n'],
                    'justify': object.l['@justify'],
                    'type': type,
                    'colnum': colnum
                });
            } else {
                array.push({
                    'indent': indent,
                    'text': object.l['#text'],
                    'lineNum': object.l['@n'],
                    'justify': object.l['@justify'],
                    'type': type,
                    'colnum': colnum
                });
            }
        }
    };


    const constructor = function (config) {
        var obj = angular.copy(config);
        if (obj) {
            obj.illustration_description = angular.fromJson(config.illustration_description);
            obj.text = angular.fromJson(config.text);
            obj.notes = angular.fromJson(config.notes);
            obj.title = angular.fromJson(config.title);
            obj.alt_title = '';
            if(obj.title.length == 2) {
                obj.alt_title = obj.title[1];
            }

            function eachRecursive(objtext, altspelling) {
                for (var k in objtext) {
                    if (typeof objtext[k] == "object" && objtext[k] !== null) {
                        if (k == 'choice') {
                            if (Array.isArray(objtext[k])) {
                                angular.forEach(objtext[k], function (spellings) {
                                    if (angular.isDefined(spellings['orig']) && angular.isDefined(spellings['orig']['#text'])) {
                                        var orig = spellings['orig']['#text'];
                                        var reg = '';

                                        // Check the reg attribute
                                        if (angular.isDefined(spellings['reg'])) {
                                            reg = spellings['reg'];
                                        }

                                        // Check the corr attribute
                                        if (angular.isDefined(spellings['corr'])) {
                                            reg = spellings['corr'];
                                        }
                                        if (Array.isArray(reg)) {
                                            angular.forEach(reg, function (v) {
                                                var alt = {reg: v['#text'].toLowerCase(), orig: orig.toLowerCase()};
                                                altspelling.push(alt);
                                            });
                                        } else {
                                            var alt = {reg: reg['#text'].toLowerCase(), orig: orig.toLowerCase()};
                                            altspelling.push(alt);
                                        }

                                    }
                                });
                            } else {
                                if (angular.isDefined(objtext[k]['orig']) && angular.isDefined(objtext[k]['orig']['#text'])) {
                                    var orig = objtext[k]['orig']['#text'];
                                    var reg = '';

                                    // Check the reg attribute
                                    if (angular.isDefined(objtext[k]['reg'])) {
                                        reg = objtext[k]['reg'];
                                    }

                                    // Check the corr attribute
                                    if (angular.isDefined(objtext[k]['corr'])) {
                                        reg = objtext[k]['corr'];
                                    }

                                    if (Array.isArray(reg)) {
                                        angular.forEach(reg, function (v) {
                                            var alt = {reg: v['#text'].toLowerCase(), orig: orig.toLowerCase()};
                                            altspelling.push(alt);
                                        });
                                    } else {
                                        var alt = {reg: reg['#text'].toLowerCase(), orig: orig.toLowerCase()};
                                        altspelling.push(alt);
                                    }
                                }
                            }
                        } else {
                            eachRecursive(objtext[k], altspelling);
                        }
                    }
                }
            }

            obj.alt_spellings = [];
            eachRecursive(obj.text, obj.alt_spellings);
            obj.header = angular.fromJson(config.header);
            obj.source = angular.fromJson(config.source);

            return obj;
        }

    };

    return GenericService(constructor);
});
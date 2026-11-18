const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let Controller;
const moduleStub = {
    controller: function(name, controller) {
        Controller = controller;
        return this;
    },
    directive: function() { return this; }
};
const source = fs.readFileSync(path.join(__dirname, '../blakearchive/static/directives/menu/directive.js'), 'utf8');
vm.runInNewContext(source, {
    angular: {
        module: function() { return moduleStub; },
        isUndefined: function(value) { return value === undefined; }
    },
    $: function() { return { click: function() {} }; },
    console: { log: function() {} }
});

const works = [
    { bad_id: 'sketch', menuTitle: 'Sketches for Robert Blair', composition_date_value: 1, medium: 'ms' },
    { bad_id: 'illustrations', menuTitle: 'Illustrations to Job', composition_date_value: 2, medium: 'ms' },
    { bad_id: 'blair', menuTitle: 'Robert Blair', composition_date_value: 3, medium: 'ms' },
    { bad_id: 'the', menuTitle: 'The Book of Job', composition_date_value: 4, medium: 'ms' },
    { bad_id: 'a', menuTitle: 'A Book of Job', composition_date_value: 5, medium: 'paint' },
    { bad_id: 'an', menuTitle: 'an Angel', composition_date_value: 6, medium: 'ms' },
    { bad_id: 'quoted', menuTitle: '"A Fairy leapt"', composition_date_value: 7, medium: 'ms' },
    { bad_id: 'book', menuTitle: 'Book of Job', composition_date_value: 8, medium: 'ms' }
];
const ids = list => Array.from(list, work => work.bad_id);

function assertOrders(menu, storage) {
    const alphabetical = ids(menu.allWorksAlpha);
    assert.deepStrictEqual(alphabetical.slice(0, 1), ['an']);
    assert.deepStrictEqual(alphabetical.slice(1, 4).sort(), ['a', 'book', 'the']);
    assert.deepStrictEqual(alphabetical.slice(4), ['quoted', 'illustrations', 'blair', 'sketch']);
    assert.deepStrictEqual(ids(menu.allWorksCompDateValue), works.map(work => work.bad_id));
    assert.deepStrictEqual(ids(storage.allWorksAlpha), alphabetical);
    assert.strictEqual(menu.allWorksAlpha.length, works.length);
    assert.strictEqual(menu.allWorksAlpha.find(work => work.bad_id === 'quoted').menuTitle, '"A Fairy leapt"');
}

async function main() {
    const storage = {};
    const service = {
        getWorks: () => Promise.resolve(works.map(work => Object.assign({}, work))),
        getExhibits: () => Promise.resolve([])
    };
    const menu = new Controller({}, service, storage, {});
    await new Promise(resolve => setImmediate(resolve));
    assertOrders(menu, storage);

    storage.allWorksAlpha.reverse();
    const cachedMenu = new Controller({}, service, storage, {});
    assertOrders(cachedMenu, storage);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

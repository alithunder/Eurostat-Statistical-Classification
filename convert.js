let fs = require('fs');
let xml2js = require('xml2js');
const async = require('async');
// const langs = ['bg', 'cz', 'da', 'de', 'ee', 'el', 'en', 'es', 'fi', 'fr', 'hr', 'hu', 'it', 'lt', 'lv', 'mt', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'si', 'sk', 'sv', 'tr'];
const folder = './files';

const output = {};
const parser = new xml2js.Parser({
    explicitArray: true,

});

const files = fs.readdirSync(folder)
async.map(files, (file, cb) => {
    fs.readFile(`${folder}/${file}`, (err, data) => {
        if (err) {
            cb(err)
        } else {
            parser.parseString(data, (err, result) => {
                const lang = result.Claset.Classification[0].Property[0].PropertyQualifier[0].$.language;
                const dataset = result.Claset.Classification[0].Item;

                let currentKey, currentIndex = -1;

                output[lang] = []

                dataset.forEach(set => {

                    if (set.$.idLevel === '1') {
                        currentKey = set.$.id
                        const newItem = {
                            code: set.$.id,
                            label: set.Label[0].LabelText[0]._,
                            subEntries: []
                        }

                        output[lang].push(newItem)
                            ++currentIndex

                    } else if (set.$.idLevel === '2') {
                        const newItem = {
                            code: set.$.id,
                            label: set.Label ? set.Label[0].LabelText[0]._ : output[lang][currentIndex].label,
                            subEntries: []
                        }

                        if (currentIndex >= 0) {
                            output[lang][currentIndex].subEntries.push(newItem)
                        }

                    } else if (set.$.idLevel === '3') {
                        const newItem = {
                            code: set.$.id,
                            label: set.Label ? set.Label[0].LabelText[0]._: '',
                            subEntries: []
                        }

                        if (currentIndex >= 0) {
                            const parent = set.$.id.split('.')[0]
                            output[lang][currentIndex].subEntries.forEach(subset => {
                                if (subset.code === parent)
                                    if (!set.Label) {
                                        newItem.label = subset.label
                                    }
                                    subset.subEntries.push(newItem)
                            })
                        }
                    } else if (set.$.idLevel === '4') {
                        const newItem = {
                            code: set.$.id,
                            label: set.Label ? set.Label[0].LabelText[0]._ : ''
                        }

                        const parent = set.$.id.split('.')[0]

                        output[lang][currentIndex].subEntries.forEach(grandSub => {
                            if (grandSub.code === parent) {
                                grandSub.subEntries.forEach(subset => {
                                    if (subset.code === `${set.$.id.substring(0,set.$.id.length-1)}`) {
                                        if (!set.Label) {
                                            newItem.label = subset.label
                                        }

                                        subset.subEntries.push(newItem)
                                    }
                                })
                            }
                        })
                    }
                })
            });
        }
        cb()

    });

}, (err, results) => {
    if (err) {
        throw err
    } else {
        let allData = JSON.stringify(output)
        fs.writeFile('output.json', allData, 'utf8', (err) => {
            if (err) {
                throw err
            } else {
                console.log('file created...')
            }
        })
    }
})


// fs.writeFile('output.json', JSON.stringify(output), 'utf8', (err) => {
//     if (err) {
//         console.log('error');
//     } else {
//         console.log('file created...')
//     }
// })
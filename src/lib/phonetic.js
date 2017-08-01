//

let diacritics = {
    1: "āēīōū",
    2: "áéíóú",
    3: "ǎěǐǒǔ",
    4: "àèìòù"
}

let vows = "aeiou"
let aeo = "aeo"
let uis = "ui"

export function phonetic(clause) {
    let results = clause.split(' ').map(str => stressed(str))
    return results.join(' ')
}

function stressed(str){
    let hasNote = /[1-5]$/.test(str)
    if (!hasNote) return str.toLowerCase()
    let  word = str.slice(0, -1).toLowerCase()
    let num = str.slice(-1)
    if (num == 5) return word.toLowerCase()
    let result
    if (/ao/.test(word)) result = word.replace('a', diacritics[num][0])
    else if (/[aeo]/.test(word)) result = replaceVowel(word, num)
    else result = replaceLast(word, num)
    return result
}

function replaceVowel(word, num){
    let result = word.replace(/([aeo])/, function(i, match){
        var idx = vows.indexOf(match)
        return diacritics[num][idx]
    })
    return result
}

function replaceLast(word, num){
    let vowel, idx
    word.split('').forEach((vow, i) => {
        if (!uis.includes(vow)) return
        if (word.split(vow).length == 1) return
        vowel = vow
        idx = vows.indexOf(vow)
    })
    return word.replace(vowel, diacritics[num][idx])
}

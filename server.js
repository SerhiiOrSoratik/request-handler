const http = require('http');
const url = require('url');

const pl = (count, one, few, many) => {
    count += '';
    if(count != 11 && count[count.length - 1] == 1) {
       return (count + ' ' + one)
    }
    else if (count[count.length - 1] >= 2 && count[count.length - 1] <= 4 && (count << 5 || count >> 21)){
        return count + ' ' + few
    }
    else if (count[count.length - 1] == 0 || (count >= 5 && count <= 20) || (count[count.length - 1] >= 5 && count[count.length - 1] <= 9)) {
       return count + ' ' + many;
    }
}

const frequency = (text) => {
    if (text === '') {
        return false;
    }
    const dividedText = text.toLowerCase().replace(/[^a-zA-Zа-яА-Яії ]+/g, "").split(' ');
    let wordsMap = new Map();
    dividedText.forEach(word => {
        if (wordsMap.has(word)) {
            wordsMap.set(word, wordsMap.get(word) + 1);
        } else {
            wordsMap.set(word, 1);
        }
    })
    return wordsMap;
}

const findMostCommonElement = (wordsMap) => {
    return ([...wordsMap.entries()].reduce((a, e) => e[1] > a[1] ? e : a))
}

const server = http.createServer((req, res) => {
    let urlHref = encodeURI(req.url);
    urlHref = url.parse(decodeURI(urlHref), true);
    pathname = urlHref.pathname;
        if(pathname === '/headers' && req.method === 'GET') {
            // curl localhost:3000/headers
            const headers = req.headers;
            console.log(headers)
            res.end(JSON.stringify(req.headers) + '\n');
        }
        else if(pathname === '/plural'  && req.method === 'GET') {
            // curl 'localhost:3000/plural?number=1&one=person&few=people&many=people'
            // curl -G 'localhost:3000/plural' --data-urlencode 'number=5' --data-urlencode 'one=год' --data-urlencode 'few=года' --data-urlencode 'many=лет'
            const number = urlHref.query.number;
            const one = urlHref.query.one;
            const few = urlHref.query.few;
            const many = urlHref.query.many;
            res.end(pl(number, one, few, many) + '\n')
        }
        else if(pathname === '/frequency' && req.method === 'POST') {
             //curl -X POST localhost:3000/frequency --data-raw "Little red fox jumps over logs. Fox is red"
             let body = '';
             req.on('data', chunk => {
                 body += chunk.toString();
             });
             req.on('end', () => {
                 const fr = frequency(body);
                 res.setHeader('Content-Type', 'application/json');
                 res.setHeader('Unique-word-count', fr.size);
                 res.setHeader('Most-common-word', findMostCommonElement(fr)[0])
                 res.writeHead(200, {'Content-Type': 'application/json'});
                 let convertedMap = {};
                 fr.forEach((value, key) => {
                    let keys = key.split('.'),
                        last = keys.pop();
                    keys.reduce((r, a) => r[a] = r[a] || {}, convertedMap)[last] = value;
                });
                 res.end(JSON.stringify(convertedMap) + '\n');
             });
        }
        else {
            res.writeHead(404, 'Not Found');
            res.end('Not Found');
        }
})

server.listen(3000, () => {
    console.log('Server start')
});
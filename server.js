const express = require('express');
const app = express();
const port = 3000;
const request = require('request');

function isEndgameOut() {

    endgameOut = false;

    function scrapeEndgame () {
        let requestEndgame = { method: 'GET',
            url: 'https://www.cineplex.com/Movie/avengers-endgame',
            headers:
                {'cache-control': 'no-cache' }
        };

        return new Promise((resolve, reject) => {
            request(requestEndgame, function (error, response, body) {
                if (error) throw new Error(error);

                page = body.toString();

                resolve(!page.includes("<div class=\"h3 text-highlight text-center text-bold fill-width position-absolute absolute-align-center pad-md\">Tickets for this movie are not available at this moment</div>"));
            });
        });
    }

    function getEndgameOut(scrapeResult) {
        let requestEndgame = { method: 'GET',
            url: 'https://www.cineplex.com/api/v1/movies/getmoviesforoneposter',
            qs:
                { Skip: '0',
                    Take: '1000',
                    language: 'en-us',
                    marketLanguageCodeFilter: 'true',
                    movieType: '0',
                    showTimeType: '0',
                    showtimeStatus: '1' },
            headers:
                {'cache-control': 'no-cache' }
        };

        return new Promise((resolve, reject) => {
            request(requestEndgame, function (error, response, body) {
                if (error) throw new Error(error);

                let page = body.toString();

                resolve(scrapeResult || page.includes("Endgame"));
            });
        });
    }


    return new Promise((resolve, reject) => {
        scrapeEndgame().then((data) => {
            return getEndgameOut(data);
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            console.log(error);
            reject(error);
        });
    });

}

let timeout = 10000;

let requestLoop = setInterval(function() {
    let releaseDate = new Date('April 26th, 2019');
    let today = new Date();
    let difference = releaseDate.getTime() - today.getTime();

    // let timeout = Math.max(difference / 3000, 30000);
    timeout = 10000;

    isEndgameOut().then(function(data) {
        console.log(data ? "Endgame is out! Go buy tickets" : "Endgame is not out yet");
    });
}, timeout);

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/endgame', (req, res) => {

    isEndgameOut().then(function(data) {
        res.send(data ? "Endgame is out! Go buy tickets" : "Endgame is not out yet");
    });

});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));



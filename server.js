const express = require('express');
const app = express();
const port = 3000;
const request = require('request');

// Twilio Config
//TODO: MAKE THE ACCOUNT SID AND AUTH TOKEN PRIVATE. ENDGAMEJS 10.0 FEATURE
const accountSid = 'AC724694e6c231af004335dfa56ce7dca3';
const authToken = 'ff2ea2074a2c2f185c357ac081bdc399';
const client = require('twilio')(accountSid, authToken);
const phoneNumbers = ['+16472077557', '+16478622877', '+16476099810'];


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

                resolve(scrapeResult && page.includes("Endgame"));
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

    var promises = [];

    // add all the different send promises to this array like following



    isEndgameOut().then(function(data) {
        if(data){
            for(let i = 0; i < phoneNumbers.length; i++){
                console.log(phoneNumbers[i]);
                promises.push(
                    client.messages.create({
                        body: 'Endgame is OUTTTT!!!!! BUY TICKETS NOW!',
                        to:   phoneNumbers[i],  // Text this number
                        from: '+16479316799' // From a valid Twilio number
                    })
                );
            }
        }
        return data;
    }).then(function(data) {
        console.log(data ? "Endgame is out! Go buy tickets" : "Endgame is not out yet");
        if(data){
            clearInterval(requestLoop);
        }
       
    });


    var finalPromise = Promise.all(promises).then((data)=>{
        console.log(data);
    });


}, timeout);

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/endgame', (req, res) => {

    isEndgameOut().then(function(data) {
        if(data){
            for(let i = 0; i < phoneNumbers.length; i++){
                console.log(i);
                client.messages.create({
                    body: 'This is ENDGAMEJS',
                    from: '+16479316799',
                    to: phoneNumbers[i]
                }).then(message => console.log(message.sid));  
            }
        }
        return data;
    }).then(function (data){
        res.send(data ? "Endgame is out! Go buy tickets" : "Endgame is not out yet"); 
    });

});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));



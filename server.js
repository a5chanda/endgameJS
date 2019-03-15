const express = require('express');
const app = express();
const port = 3000;
const request = require('request');

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/endgame', (req, res) => {
    var options = { method: 'GET',
        url: 'https://www.cineplex.com/Movie/avengers-endgame',
        headers:
            { 'Postman-Token': '433fd9ce-0c5e-4762-8cf3-2be3d7880337',
                'cache-control': 'no-cache' } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        let endgameOut = false;

        page = body.toString();

        //console.log(page);

        endgameOut = !page.includes("<div class=\"h3 text-highlight text-center text-bold fill-width position-absolute absolute-align-center pad-md\">Tickets for this movie are not available at this moment</div>");

        res.send(endgameOut ? "Endgame is out! Go buy tickets" : "Endgame is not out yet");
    });

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));



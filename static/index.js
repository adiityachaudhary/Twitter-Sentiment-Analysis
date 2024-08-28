document.addEventListener('DOMContentLoaded', () => {
    // Handle form submission for searching tweets
    document.querySelector('#form').onsubmit = () => {
        return processSearch();
    };

    // Filter buttons in Tab 1 for different tweet sentiments and types
    document.querySelector('#psenti').onclick = () => {
        return processSearch(tweet => tweet[1] >= 0);
    };

    document.querySelector('#nsenti').onclick = () => {
        return processSearch(tweet => tweet[1] < 0);
    };

    document.querySelector('#opi').onclick = () => {
        return processSearch(tweet => tweet[2] >= 0.5);
    };

    document.querySelector('#fac').onclick = () => {
        return processSearch(tweet => tweet[2] < 0.5);
    };

    // Function to handle search and filter operations in Tab 1
    function processSearch(filterFn = null) {
        document.querySelector('#search_list').innerHTML = "";
        const request = new XMLHttpRequest();
        const search_query = document.querySelector('#form-username').value;
        request.open('POST', '/search');

        request.onload = () => {
            if (request.status === 200) {
                const data = JSON.parse(request.responseText);
                if (data.tweets) {
                    const tweets = filterFn ? data.tweets.filter(filterFn) : data.tweets;
                    tweets.forEach(tweet => {
                        const li = document.createElement('li');
                        const p = document.createElement('p');
                        p.innerHTML = tweet; // Assuming tweet text is the whole content for simplicity
                        li.append(p);
                        document.querySelector('#search_list').append(li);
                    });
                    if (tweets.length === 0) {
                        document.querySelector('#search_list').innerHTML = "No matching tweets found.";
                    }
                } else {
                    console.error('No data returned from the server');
                    document.querySelector('#search_list').innerHTML = "No data returned from the server.";
                }
            } else {
                console.error('There was a problem with the request.');
                document.querySelector('#search_list').innerHTML = "There was a problem with the request.";
            }
        };

        const data = new FormData();
        data.append('search_query', search_query);
        request.send(data);
        return false;
    }

    // Function to analyze manually pasted tweet in Tab 2
    function analyzePastedTweet() {
        const tweet_text = document.querySelector('#tweet_text').value;
        const resultElement = document.querySelector('#analysis_result');

        const request = new XMLHttpRequest();
        request.open('POST', '/analyze_tweet', true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        request.onload = function() {
            if (request.status == 200) {
                try {
                    const response = JSON.parse(request.responseText);
                    if (response.success) {
                        resultElement.innerHTML = `Sentiment: <strong>${response.sentiment}</strong> (Polarity: ${response.polarity.toFixed(2)}, Subjectivity: ${response.subjectivity.toFixed(2)})`;
                        resultElement.style.color = response.sentiment === 'Positive' ? 'green' : response.sentiment === 'Negative' ? 'red' : 'grey';
                    } else {
                        resultElement.innerHTML = 'Error processing the request: ' + response.error;
                        resultElement.style.color = 'red';
                    }
                } catch(e) {
                    resultElement.innerHTML = 'Error parsing JSON response.';
                    resultElement.style.color = 'red';
                }
            } else {
                resultElement.innerHTML = 'Failed to send the request, status code: ' + request.status;
                resultElement.style.color = 'red';
            }
        };

        request.send('tweet_text=' + encodeURIComponent(tweet_text));
    }

    // Attach the analyzePastedTweet function to the analyzeButton's click event
    var analyzeButton = document.querySelector('#analyzeButton');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', analyzePastedTweet);
    } else {
        console.log('Analyze button not found');
    }
});
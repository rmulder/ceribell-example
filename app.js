$(function () {
        "use strict";
        // for better performance - to avoid searching in DOM
        var content = $('#content');
        var input = $('#input');
        var status = $('#status');
    
        // my color assigned by the server
        var myColor = false;
        // my name sent to the server
        var myName = false;
    
        // if user is running mozilla then use it's built-in WebSocket
        window.WebSocket = window.WebSocket || window.MozWebSocket;
    
        // if browser doesn't support WebSocket, just show some notification and exit
        if (!window.WebSocket) {
            content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                        + 'support WebSockets.'} ));
            input.hide();
            $('span').hide();
            return;
        }
    
        // open connection
        var connection = new WebSocket('ws://127.0.0.1:8080');
    
        connection.onopen = function () {
            console.log('inside connection.onopen...');
            connection.send('getData');
        };
    
        connection.onerror = function (error) {
            // just in there were some problems with conenction...
            content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                        + 'connection or the server is down.' } ));
        };
    
        // most important part - incoming messages
        connection.onmessage = function (message) {
            console.log('received message: ', message);
            // try to parse JSON message. Because we know that the server always returns
            // JSON this should work without any problem but we should make sure that
            // the massage is not chunked or otherwise damaged.
            try {
                var json = JSON.parse(message.data);
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ', message.data);
                return;
            }
    
            // NOTE: if you're not sure about the JSON structure
            // check the server source code above
            if (json.type === 'data') {
                //console.log('json.data: ', json.data);
                console.log('length of data: ' + json.data.length);
                const tmpData = json.data.slice(0, 50000);
                //const tmpData = json.data;
                const channelData = {};
                const channelLabels = [];

                let rowCounter = 0;
                tmpData.forEach((row) => {
                    //console.log('row: ', row);
                    for (let attr in row) {
                        if (row.hasOwnProperty(attr)) {
                            if (!channelData[attr]) { channelData[attr] = []; }
                            channelData[attr].push(row[attr])
                        }
                    }

                    channelLabels.push(rowCounter++);
                });

                console.log('channelData: ', channelData);
                const chartData = {
                    type: 'line',
                    data: {
                        labels: channelLabels,
                        datasets: [{
                                label: "Channel 1",
                                fillColor: "rgba(220,220,220,0.2)",
                                strokeColor: "rgba(220,220,220,1)",
                                pointColor: "rgba(220,220,220,1)",
                                pointStrokeColor: "#fff",
                                pointHighlightFill: "#fff",
                                pointHighlightStroke: "rgba(220,220,220,1)",
                                data: channelData['Channel 1']
                            },
                            {
                                label: "Channel 2",
                                fillColor: "rgba(151,187,205,0.2)",
                                strokeColor: "rgba(151,187,205,1)",
                                pointColor: "rgba(151,187,205,1)",
                                pointStrokeColor: "#fff",
                                pointHighlightFill: "#fff",
                                pointHighlightStroke: "rgba(151,187,205,1)",
                                data: channelData['Channel 2']
                            },
                            {
                                label: "Channel 3",
                                fillColor: "rgba(151,187,205,0.2)",
                                strokeColor: "rgba(151,187,205,1)",
                                pointColor: "rgba(151,187,205,1)",
                                pointStrokeColor: "#fff",
                                pointHighlightFill: "#fff",
                                pointHighlightStroke: "rgba(151,187,205,1)",
                                data: channelData['Channel 3']
                            },
                            {
                                label: "Channel 4",
                                fillColor: "rgba(151,187,205,0.2)",
                                strokeColor: "rgba(151,187,205,1)",
                                pointColor: "rgba(151,187,205,1)",
                                pointStrokeColor: "#fff",
                                pointHighlightFill: "#fff",
                                pointHighlightStroke: "rgba(151,187,205,1)",
                                data: channelData['Channel 4']
                            },
                            {
                                label: "Channel 5",
                                fillColor: "rgba(151,187,205,0.2)",
                                strokeColor: "rgba(151,187,205,1)",
                                pointColor: "rgba(151,187,205,1)",
                                pointStrokeColor: "#fff",
                                pointHighlightFill: "#fff",
                                pointHighlightStroke: "rgba(151,187,205,1)",
                                data: channelData['Channel 5']
                            },
                            {
                                label: "Channel 6",
                                fillColor: "rgba(151,187,205,0.2)",
                                strokeColor: "rgba(151,187,205,1)",
                                pointColor: "rgba(151,187,205,1)",
                                pointStrokeColor: "#fff",
                                pointHighlightFill: "#fff",
                                pointHighlightStroke: "rgba(151,187,205,1)",
                                data: channelData['Channel 6']
                            },
                            {
                                label: "Channel 7",
                                fillColor: "rgba(151,187,205,0.2)",
                                strokeColor: "rgba(151,187,205,1)",
                                pointColor: "rgba(151,187,205,1)",
                                pointStrokeColor: "#fff",
                                pointHighlightFill: "#fff",
                                pointHighlightStroke: "rgba(151,187,205,1)",
                                data: channelData['Channel 7']
                            },
                            {
                                label: "Channel 8",
                                fillColor: "rgba(151,187,205,0.2)",
                                strokeColor: "rgba(151,187,205,1)",
                                pointColor: "rgba(151,187,205,1)",
                                pointStrokeColor: "#fff",
                                pointHighlightFill: "#fff",
                                pointHighlightStroke: "rgba(151,187,205,1)",
                                data: channelData['Channel 8']
                            }
                        ]
                    },
                    options: {
                        responsive: true
                    }
                };

                console.log('chartData: ', chartData);
                var ctxL = document.getElementById("lineChart").getContext('2d');
                var myLineChart = new Chart(ctxL, chartData);
            } else if (json.type === 'color') { // first response from the server with user's color
                myColor = json.data;
                status.text(myName + ': ').css('color', myColor);
                input.removeAttr('disabled').focus();
                // from now user can start sending messages
            } else if (json.type === 'history') { // entire message history
                // insert every single message to the chat window
                for (var i = 0; i < json.data.length; i++) {
                    addMessage(json.data[i].author, json.data[i].text,
                               json.data[i].color, new Date(json.data[i].time));
                }
            } else if (json.type === 'message') { // it's a single message
                input.removeAttr('disabled'); // let the user write another message
                addMessage(json.data.author, json.data.text,
                           json.data.color, new Date(json.data.time));
            } else {
                console.log('Hmm..., I\'ve never seen JSON like this: ', json);
            }
        };
    
        /**
         * Send mesage when user presses Enter key
         */
        input.keydown(function(e) {
            if (e.keyCode === 13) {
                var msg = $(this).val();
                if (!msg) {
                    return;
                }
                // send the message as an ordinary text
                connection.send(msg);
                $(this).val('');
                // disable the input field to make the user wait until server
                // sends back response
                input.attr('disabled', 'disabled');
    
                // we know that the first message sent from a user their name
                if (myName === false) {
                    myName = msg;
                }
            }
        });
    
        /**
         * This method is optional. If the server wasn't able to respond to the
         * in 3 seconds then show some error message to notify the user that
         * something is wrong.
         */
        setInterval(function() {
            if (connection.readyState !== 1) {
                status.text('Error');
                input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                     + 'with the WebSocket server.');
            }
        }, 3000);
    
        /**
         * Add message to the chat window
         */
        function addMessage(author, message, color, dt) {
            content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
                 + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
                 + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
                 + ': ' + message + '</p>');
        }
    });

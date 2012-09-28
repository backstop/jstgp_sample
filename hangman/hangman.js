
exports.Hangman = function(dictionary) {
    this.uuid = require('node-uuid');
    this.gameState = "collectingAttendees";
    this.numberOfPeople = 0;
    this.people = {};
};

exports.Hangman.prototype = {
    withTokenValidation: function(token, ifValid, ifInvalid, ifMissing) {
        if (token) {
            if (this.people[token]) {
                return ifValid();
            } else {
                return ifInvalid();
            }
        } else {
            return ifMissing();
        }
    },

    getGameState: function (token) {
        var me = this,
            joinAllowed = function () {
                return {state: me.gameState, actions: ['Join']};
            },
            invalidToken = function () {
                var response = joinAllowed();
                response.error = "Player token not recognized";
                return response;
            };

        if (this.gameState == 'collectingAttendees') {
            return this.withTokenValidation(token, function () {
                return {state:me.gameState, actions:[]};
            }, invalidToken, joinAllowed);
        } else if (this.gameState == 'readyToStart') {
            return this.withTokenValidation(token, function () {
                return {state:me.gameState, actions:['Start Game']};
            }, invalidToken, joinAllowed);
        }
        return {};
    },

    submitEvent: function(params) {
        var uuid, invalid, result,
            response = {actions: []},
            action = params.action;
        if (this.gameState == 'collectingAttendees') {
            if (action == 'Join') {
                uuid = this.uuid.v4();
                response.token = uuid;
                this.people[uuid] = params.name;
                this.numberOfPeople++;

                if (this.numberOfPeople == 2) {
                    this.gameState = "readyToStart";
                    response.actions.push("Start Game");
                }
            }
        } else if (this.gameState == "readyToStart") {
            if (action == "Join") {
                response.error = "This game already has two players - no more can join";
            } else if (action == 'Start Game') {
                invalid = function() { return {started: false, error: "Only existing current players can start the game"}; };
                result = this.withTokenValidation(params.token,
                    function () {
                        return {started:true};
                    }, invalid, invalid);

                if (result.started) {
                    this.gameState = 'guessing';
                } else {
                    response.error = result.error;
                }
            }
        }
        response.state = this.gameState;
        return response;
    }
};


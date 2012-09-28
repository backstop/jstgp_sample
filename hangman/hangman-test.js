var vows = require('vows'),
    assert = require('assert'),
    hangman = require('./hangman'),
    Hangman = hangman.Hangman,
    playerOneToken = null,
    playerTwoToken = null;

vows.describe('The Game Engine').addBatch({
    'when there is no game running': {
        topic: new(Hangman),

        'should be a new game to join': function(game) {
            assert.deepEqual(game.getGameState(), {state: 'collectingAttendees', actions: ['Join']});
        },

        'should be able to join the game': function(game) {
            var result = game.submitEvent({action: 'Join', name: 'Bob Test'});
            assert.equal(result.state, "collectingAttendees");
            assert.equal(result.actions.length, 0);
            assert.isString(result.token);
            playerOneToken = result.token;
            assert.deepEqual(game.getGameState(result.token), {state: 'collectingAttendees', actions: []});
            assert.deepEqual(game.getGameState('junk'), {state: 'collectingAttendees', actions: ['Join'], error: "Player token not recognized"});
        },

        'should be able to accept second attendee': function(game) {
            var result;
            assert.deepEqual(game.getGameState(), {state: 'collectingAttendees', actions: ['Join']});
            result = game.submitEvent({action: 'Join', name: 'George Test'});
            assert.equal(result.state, "readyToStart");
            assert.equal(result.actions[0], "Start Game");
            assert.isString(result.token);
        },

        'should stop collecting players when two have joined': function (game) {
            var result = game.submitEvent({action: 'Join', name: 'Bill Test'});
            assert.equal(result.state, "readyToStart");
            assert.equal(result.actions.length, 0);
            assert.equal(result.error, "This game already has two players - no more can join");
        },

        "should be able to start the game when player one's token is passed in": function(game) {
            var result;
            assert.deepEqual(game.getGameState(playerOneToken), {state: 'readyToStart', actions: ['Start Game']});
            result = game.submitEvent({action: 'Start Game'});
            assert.equal(result.state, "readyToStart");
            assert.equal(result.actions.length, 0);
            assert.equal(result.error, "Only existing current players can start the game");

            result = game.submitEvent({action: 'Start Game', token: "invalidtoken"});
            assert.equal(result.state, "readyToStart");
            assert.equal(result.actions.length, 0);
            assert.equal(result.error, "Only existing current players can start the game");

            result = game.submitEvent({action: 'Start Game', word: 'hangman', token: playerOneToken});
            assert.equal(result.state, "guessing");
            assert.equal(result.actions.length, 0);
        },

        "should accept guesses from valid users in the correct order": function(game) {
            var result;
            assert.deepEqual(game.getGameState(playerOneToken), {state: "guessing", actions: ['Guess']});
            assert.deepEqual(game.getGameState(playerTwoToken), {state: "guessing", actions: []});
        }
}
}).export(module);
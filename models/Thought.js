const { Schema, model } = require('mongoose');
const moment = require('moment');
const ReactionSchema = require("./Reaction")


const ThoughtSchema = new Schema({
    thoughtText: {
        type: String,
        required: function() {
            return this.thoughtText.length >= 1 && this.thoughtText.length <= 280;
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get: function(createdAt) {
            return moment(createdAt).format("m/d/YYYY HH:MM:SS");
        }
    },
    username: {
        type: String,
        required: true
    },
    reactions: [
        ReactionSchema
    ]
}, {
    toJSON: {
        virtuals: true,
        getters: true
    },
    id: false,
    timestamps: { createdAt: 'created_at' }
});

ThoughtSchema.virtual('reactionCount').get(function() {
    return this.reactions.length;
});

const Thought = model('Thought', ThoughtSchema);

module.exports = Thought;
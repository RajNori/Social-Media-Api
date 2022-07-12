var app = require("express");
var router = app.Router();
var { User, Thought } = require("../../models");

router.get("/", async(req, res) => {
    let retThought = await Thought.find({});
    res.json(retThought);
});

router.post("/", async(req, res) => {

    let retThought = await Thought.create({ thoughtText: req.body.thoughtText, username: req.body.username })
        .catch(err => { res.json({ error: 1, message: err }) });
    if (!retThought) {
        res.json({ message: "Cannot create thought.", error: 1 })
    }
    let newThoughtId = retThought._id;
    let retUser = await User.findOneAndUpdate({ username: req.body.username }, {
        $push: { thoughts: newThoughtId }
    }, { new: true }).populate({ path: "thoughts", select: "-__v" }).populate({ path: "friends", select: "-__v" }).select("-__v");

    res.json(retUser)
});

router.get("/:thoughtId", async(req, res) => {
    let retThought = await Thought.findOne({ _id: req.params.thoughtId });
    res.json(retThought);
});

router.put("/:thoughtId", async(req, res) => {
    let retThought = await Thought.findOneAndUpdate({ _id: req.params.thoughtId }, { thoughtText: req.body.thoughtText }, { new: true });
    res.json(retThought);
});


router.delete("/:thoughtId", async(req, res) => {
    let retUserAndThought = await Thought.findOneAndDelete({ _id: req.params.thoughtId }).then(async(deletedThought) => {
        if (!deletedThought)
            res.status(404).json({ message: "No thought with this id. Did you delete more than once?", error: 1 });
        else {
            let ownerOfDeletedThought = deletedThought.username;
            let idOfDeletedThought = deletedThought._id;
            // console.log({ deletedThought });
            var cascader = await User.findOneAndUpdate({ username: ownerOfDeletedThought }, {
                $pull: { thoughts: idOfDeletedThought }
            }, { new: true }).populate({ path: "thoughts", select: "-__v" }).populate({ path: "friends", select: "-__v" }).select("-__v");
            return cascader;
        };
    }); // ^let retThought...

    res.json({ message: "Thought deleted and thought also deleted from associated user", user: retUserAndThought });
}); 

router.post("/:thoughtId/reactions", async(req, res) => {
    let retThought = await Thought.findOneAndUpdate({ _id: req.params.thoughtId }, {
        $push: {
            reactions: {
                reactionBody: req.body.reactionBody,
                username: req.body.username
            }
        }
    }, { new: true });

    res.json(retThought);
});

// DELETE to pull and remove a reaction by the reaction's reactionId value
// DELETE /api/thoughts/:thoughtId/reactions/:reactionId
router.delete("/:thoughtId/reactions/:reactionId", async(req, res) => {
    let retThought = await Thought.findOneAndUpdate({ _id: req.params.thoughtId }, {
        $pull: {
            reactions: {
                reactionId: req.params.reactionId
            }
        }
    }, { new: true });

    res.json(retThought);
});

module.exports = router;
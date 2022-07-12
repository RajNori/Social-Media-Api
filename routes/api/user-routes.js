var app = require("express");
var router = app.Router();
var { User, Thought } = require("../../models");

router.get("/", async(req, res) => {
    let retUsers = await User.find({}).select("-__v").populate({ path: "thoughts", select: "-__v" }).populate({ path: "friends", select: "-__v" });

    res.json(retUsers);
});

router.post("/", async(req, res) => {

    let retUser = await User.create({ username: req.body.username, email: req.body.email }).catch(err => {
        if (err.code === 11000) {
            var duplicateKey = Object.keys(err.keyValue)[0];
            var duplicateVal = err.keyValue[duplicateKey];
            err = `Unable to create because ${duplicateKey} '${duplicateVal}' already taken`;
        }
        res.status(500).json({ message: err, error: 1 });
    })
    res.json(retUser);
});


router.get("/:userId", async(req, res) => {
    let retUser = await User.findOne({
        _id: req.params.userId
    }).populate({ path: "thoughts", select: "-__v" }).populate({ path: "friends", select: "-__v" }).select("-__v");
    res.json(retUser);
});

router.put("/:userId", async(req, res) => {
    let retUser = await User.findOneAndUpdate({
        _id: req.params.userId
    }, { email: req.body.email }, { new: true }).populate({ path: "thoughts", select: "-__v" }).populate({ path: "friends", select: "-__v" }).select("-__v");
    res.json(retUser);
});

router.delete("/:userId", async(req, res) => {
    let retUser = await User.findOneAndDelete({
        _id: req.params.userId
    }).select("-__v");
    res.json({ message: "Deleted user", user: retUser });
});

router.post("/:userId/friends/:friendId", async(req, res) => {
    let retUser = await User.findOneAndUpdate({ _id: req.params.userId }, { $push: { friends: req.params.friendId } }, { new: true }).populate({ path: "thoughts", select: "-__v" }).populate({ path: "friends", select: "-__v" }).select("-__v");
    res.json(retUser);
});


router.delete("/:userId/friends/:friendId", async(req, res) => {
    let retUser = await User.findOneAndUpdate({ _id: req.params.userId }, { $pull: { friends: req.params.friendId } }, { new: true }).populate({ path: "thoughts", select: "-__v" }).populate({ path: "friends", select: "-__v" }).select("-__v");
    res.json({ message: "Deleted friend and updated the friend list of the associated user", user: retUser });
});

module.exports = router;
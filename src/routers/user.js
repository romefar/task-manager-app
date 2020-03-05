const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }

    // user.save()
    //     .then(data => res.status(201).send(data))
    //     .catch(error => {
    //         res.status(400).send(error)
    //     });
});

router.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body; 
        const user = await User.fundByCredintials(email, password);
        const token = await user.generateAuthToken(); 
        res.send({ user, token });
    } catch (error) {
        res.status(400).send();
    }
});

router.get('/users/me', auth, async (req, res) => {

    res.send(req.user);
    // try {
    //     const users = await User.find({});
    //     res.send(users);
    // } catch (error) {
    //     res.status(500).send(error);
    // }

    // User.find({})
    //     .then(users => res.send(users))
    //     .catch(err => res.status(500).send())   
});

router.get('/users/:id', async (req, res) => {
    try {
        const _id = req.params.id;
        const user = await User.findById(_id);

        if (!user) return res.status(404).send();

        res.send(user);
    } catch (error) {
        res.status(500).send()
    }

    // User.findById(_id)
    //     .then(user => {
    //         if(!user) return res.status(404).send();
    //         res.send(user);
    //     })
    //     .catch(err => res.status(500).send())
});

router.patch('/users/:id', async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = Object.keys(User.schema.obj); // ['name', 'email', 'password', 'age'];
    const isValidUpdate = updates.every(item => allowedUpdates.includes(item));

    if (!isValidUpdate) return res.status(400).send({ error: "Invalid updates!" })

    try {

        const user = await User.findById(_id);

        updates.forEach(item => user[item] = req.body[item]);

        await user.save()

        //const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });

        if (!user) return res.status(404).send();

        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findByIdAndDelete(_id);

        if (!user) return res.status(404).send();

        res.send(user);

    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
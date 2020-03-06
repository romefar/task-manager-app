const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

router.post('/tasks', auth, async (req, res) => { 
    const task = new Task({
        ...req.body,
        owner : req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).end(error);
    }
    // task.save()
    //     .then(data => res.status(201).send(data))
    //     .catch(err => res.status(400).send(err));
});

router.get('/tasks', auth, async (req, res) => { 
    try {
        const tasks = await Task.find({ owner : req.user._id });
        // another approach 
        // const s = await req.user.populate('tasks').execPopulate();
        res.send(tasks);
    } catch (error) {
        res.status(500).send()
    }
    // Task.find({})
    //     .then(tasks => res.send(tasks))
    //     .catch(err => res.status(500).send())
});

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOne({ _id, owner : req.user._id });
        
        if(!task) return res.status(404).send();
         
        res.send(task);
    } catch (error) {
        res.status(500).send()
    }
});

router.patch('/tasks/:id', auth,  async (req, res) => {
    const _id = req.params.id;
    try {
        const allowedUpdates = Object.keys(Task.schema.obj);
        const updates = Object.keys(req.body);
        const isValidUpdate = updates.every(item => allowedUpdates.includes(item));
        
        if(!isValidUpdate) return res.status(400).send({error : "Invalid update!"});    

        const task = await Task.findOne({ _id, owner: req.user._id });
        
        if(!task) return res.status(404).send();

        updates.forEach(item => task[item] = req.body[item]);
        
        await task.save();

        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => { 
    const _id = req.params.id;

    try {
        const task = await Task.findOneAndDelete({ _id, owner : req.user._id});

        if(!task) return res.status(404).send();

        res.send(task); 
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
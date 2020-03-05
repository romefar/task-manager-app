const express = require('express');
const router = new express.Router();

const Task = require('../models/task');

router.post('/tasks', async (req, res) => { 
    const task = new Task(req.body);
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

router.get('/tasks', async (req, res) => { 
    try {
        const tasks = await Task.find({});
        res.send(tasks);
    } catch (error) {
        res.status(500).send()
    }
    // Task.find({})
    //     .then(tasks => res.send(tasks))
    //     .catch(err => res.status(500).send())
});

router.get('/tasks/:id', async (req, res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findById(_id);
        
        if(!task) return res.status(404).send();
        
        res.send(task);
    } catch (error) {
        res.status(500).send()
    }
    // Task.findById(_id)
    //     .then(task => {
    //         if(!task) return res.status(404).send();
            
    //         res.send(task);
    //     })
    //     .catch(err => res.status(500).send())
});

router.patch('/tasks/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const allowedUpdates = Object.keys(Task.schema.obj);
        const updates = Object.keys(req.body);
        const isValidUpdate = updates.every(item => allowedUpdates.includes(item));
        
        if(!isValidUpdate) return res.status(400).send({error : "Invalid update!"});    

        const task = await Task.findById(_id);
        
        updates.forEach(item => task[item] = req.body[item]);
        
        await task.save();

       // const task = await Task.findByIdAndUpdate(_id, req.body, { new : true, runValidators : true });

        if(!task) return res.status(404).send();

        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/tasks/:id', async (req, res) => { 
    const _id = req.params.id;

    try {
        const task = await Task.findByIdAndDelete(_id);

        if(!task) return res.status(404).send();

        res.send(task); 
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
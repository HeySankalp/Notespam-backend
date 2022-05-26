const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');



//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------ROUTE 1---------GET all notes ofloggedin user using /api/notes.fetchnotes------------------LOGIN reuied
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.get('/fetchnotes', fetchuser, async (req, res) => {
    try {

        // notes using user id which is fetched  from fetchuser middleware

        const notes = await Notes.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("entenal server error");
    }
});



//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------ROUTE 2---------POST all notes of loggedin user using /api/notes/addnotes ---------------LOGIN required
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.post('/addnote', fetchuser, [

    //---------------------------adding validation for title and description------------------------------------ 

    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Enter a valid description').isLength({ min: 5 })], async (req, res) => {
        try {

            const { title, description } = req.body;

            //--------------------sending json formmat error if validation viaolated----------------------------

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            //----------------------------------------creating note obj-----------------------------------------

            const note = await new Notes({
                title, description, user: req.user.id
            })

            //------------------------------------------saving note obj------------------------------------------

            const savedNote = await note.save()

            res.json(savedNote)

        } catch (error) {
            console.log(error.message);
            res.status(500).send("entenal server error");
        }
    });



//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------ROUTE 3---------update all notes of loggedin user using /api/notes/updatenote ------------LOGIN required
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


router.put('/updatenote/:id', fetchuser, async (req, res) => {

    try {
        const { title, description } = req.body

        //create a new obj
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };

        //find the note to update
        let note = await Notes.findById(req.params.id);
        if (!note) { res.send(404).send("Oops! Not found") }

        //maching logged in user's id
        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not Allowed");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })

        res.json({ note });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("entenal server error");
    }
})

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//------ROUTE 3-------delete notes all notes of loggedin user using /api/notes/deletenote----------LOGIN required
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
    //find the note which is to be deleted
    let note = await Notes.findById(req.params.id);
    if (!note) { res.send(404).send("Oops! Not found") }

     //maching logged in user's id
     if (note.user.toString() !== req.user.id) {
        return res.status(404).send("Not Allowed");
    }
    note = await Notes.findByIdAndDelete(req.params.id)
    res.json("SUCCESS : note has been deleted");

} catch (error) {
    console.log(error.message);
    res.status(500).send("entenal server error");
}
})


module.exports = router
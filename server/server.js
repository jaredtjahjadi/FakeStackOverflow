// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

/*
    This is all preliminary setup. Don't change this unless there's a good reason to do so.
*/

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const session = require('express-session')
const MongoStore = require('connect-mongo')

const Question = require('./models/questions')
const Tag = require('./models/tags')
const Answer = require('./models/answers')
const Comment = require('./models/comments')
const User = require('./models/users')

const app = express();
const port = 8000;
const secret = process.argv[2];

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(express.json())
app.use(session({
    secret: `howtf`,
    cookie: {},
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/fake_so'})
}))

// Import the mongoose module
const mongoose = require('mongoose');

// Set up default mongoose connection
const mongoDB = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

// Get the default connection
let db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.listen(port, () => { console.log(`fake_so app on port ${port}`) })

app.use(express.json())

/*
    User roles
*/

const USER = 'USER'
const ADMIN = 'ADMIN'

/*
    Define all routes that fake_so can communicate with the server by
*/

/*
    Routes for the Welcome page
*/

app.get('/', (req,res) => {
    if(req.session.username) res.status(200).send() // Session for the user still exists
    else return res.status(401).send() // Session expired
    
})

app.post('/register', async (req, res) => {
    User.find({email: req.body.email}).exec()
        .then(async users => {
            if(users.length > 0)
                return res.status(400).send({
                    message: "Email is already associated with an existing account."
                })
            else {
                hashPassword(req.body.password)
                .then(async hash => {
                    const data = req.body
                    const user = new User({
                        username: data.username,
                        email: data.email,
                        passwordHash: hash,
                        role: USER,
                        reputation: 0,
                        timeJoined: new Date()
                    })
                    user.save()
                    return res.status(200).send()
                })
            }
        })
})

app.post('/login', async (req, res) => {
    // Email must be registered with a user.
    const user = await User.findOne({email: req.body.email}).exec()
    if(user.length == 0) {
        return res.status(403).send({
            message: "The given email is not registered with a user."
        })
    }

    // Password must be correct
    const verdict = await bcrypt.compare(req.body.password, user.passwordHash)
    if(!verdict) {
        return res.status(403).send({
            message: "The password is incorrect."
        })
    }

    req.session.username = user.username
    res.status(200).send()
})

/*
    User Profile
*/

app.get('/userProfile', (req,res) => {
    User.findOne({username: req.session.username}).exec()
        .then(user => {
            res.send({
                username: user.username,
                reputation: user.reputation,
                timeJoined: user.timeJoined
            })
        })
})

app.get('/postedQuestions', (req, res) => {
    Question.find({asked_by: req.session.username}).exec()
        .then(questions => { res.send(questions) })
})

/*
    Routes for the main fake_so page
*/

app.get('/username', (req, res) => {
    res.send(req.session.username)
})

app.get('/newestQuestions', (req, res) => {
    Question.find({}).sort({ask_date_time: -1}).exec()
        .then(questions => {
            questions = formatQuestions(questions)
            res.send(questions)
        })
})

app.get('/activeQuestions', (req, res) => {

    async function getQuestionsByActivity() {

        let questions = await Question.find({}).sort({answers: -1});
        searchResults = formatQuestions(questions)
        res.send(searchResults)
    }

    getQuestionsByActivity()
})

app.get('/unansweredQuestions', (req, res) => {
    Question.find({answers: {$size: 0}}).sort({ask_date_time: -1}).exec()
        .then(questions => {
            questions = formatQuestions(questions)
            res.send(questions)
        })
})

app.get('/answers/:questionId', async (req, res) => {
    const q = await Question.findById(req.params.questionId);
    Answer.find({_id: {$in: q.answers}}).exec().then(answers => {
        answers = formatAnswers(answers);
        res.send(answers);
    })
})

// Tags for a specific question
app.get('/tags', (req, res) => {
    const tagIds = Object.values(req.query)

    try {
        Tag.find({ _id: {$in: tagIds}}).exec().then(tags => {
            tags = formatTags(tags)
            res.send(tags)
        })
    } catch(error) { console.error(error) }
})

app.get('/questions/:questionId/comments', async (req, res) => {
    const q = await Question.findById(req.params.questionId);
    Comment.find({_id: {$in: q.comments}}).exec().then(comments => {
        comments = formatComments(comments);
        res.send(comments);
    })
})

app.get('/answers/:answerId/comments', async (req, res) => {
    const a = await Answer.findById(req.params.answerId);
    Comment.find({_id: {$in: a.comments}}).exec().then(comments => {
        comments = formatComments(comments);
        res.send(comments);
    })
})

app.post('/logout', async (req, res) => {
    req.session.destroy(err => {
        if(err) res.status(500).send('Logout failed. Please try again later.')
        else res.status(200).send()
    })
})

// All tags (for tags page)
app.get('/alltags', (req, res) => {
    try {
        Tag.find({}).exec().then(tags => {
            tags = formatTags(tags)
            res.send(tags)
        })
    }
    catch(error) { console.error(error) }
})

// Questions for a specific tag
app.get('/tagQuestions', (req, res) => {
    Question.find({ tags: req.query.tid }).exec().then(questions => {
        questions = formatQuestions(questions);
        res.send(questions);
    })
})

app.get('/searchResults', (req, res) => {
    const input = Object.values(req.query)[0]

    // Nothing was typed in the search bar, so just return all questions sorted by newest...
    if(input === undefined) {
        Question.find({}).sort({ask_date_time: -1}).exec()
        .then(questions => {
            questions = formatQuestions(questions)
            res.send(questions)
        })
    }

    else {
        const getSearchResults = async () => {
            const tag_regex = /\[[^\][]*\]/g;
            
            let tags = input.match(tag_regex);
            if(tags == null) tags = [];
            else tags = tags.map(s => s.replace(/[\][]/g, ''));
            
            let keywords = input.replace(tag_regex ,' ')
            if(/^\s*$/.test(keywords)) keywords = [];
            else keywords = keywords.replace(/\s+/g, ' ').trim().split(' ');
            
            let searchResults = [];

            let tagIds = await Tag.find({name: {$in: tags}}).select('_id');
            tagIds = tagIds.map(t => t._id.toString())

            const questions = await Question.find({}).sort({ask_date_time: -1});

            for(let q of questions) {
                let curr_tags = q.tags.map(t => t.toString())
                if(curr_tags.some(t => tagIds.includes(t))) searchResults.push(q)

                else if(keywords.some(k => q.title.toLowerCase().indexOf(k.toLowerCase()) > -1 || q.text.toLowerCase().indexOf(k.toLowerCase()) > -1))
                    searchResults.push(q)
            }

            searchResults = formatQuestions(searchResults)
            res.send(searchResults)
        }
        getSearchResults()
    }
})

app.post('/addQuestion', (req, res) => {
    async function addQuestion() {
        try{
            const data = req.body
            const tagIds = []
            /*
                Search for the tag IDs associated with the given tag names, 
                and insert them into the new question document
            */
            await Tag.find({ name: {$in: data.tags}}).exec()
                .then(tags => {
                    for(t of data.tags) {
                        let tag = tags.find(tag => tag.name == t)
                        if(tag != undefined) tagIds.push(tag._id)
                        else {
                            // Create a new tag if not found
                            const tag = new Tag({name: t})
                            tag.save()
                            tagIds.push(tag._id)
                        }
                    }

                    data.tags = tagIds;
                    const question = new Question(data)
                    question.save()
                    res.status(200).send()
                })
        } catch(error) { console.log(error) }
    }
    addQuestion()
})

app.post('/modifyQuestion', (req, res) => {
    async function modifyQuestion() {
        try {
            let tags = await Tag.find({name: {$in: req.body.tags}})
            tags = tags.map(tag => tag._id)
            req.body.tags = tags
            await Question.findOneAndUpdate({_id: req.body._id},  {$set: req.body})
            res.status(200).send()
        } catch(error) {console.log(error)}
    }
    modifyQuestion()
})

app.post('/postAnswer', (req, res) => {
    async function postAnswer() {
        try {
            const ans = new Answer({
                text: req.body.text,
                ans_by: req.body.ans_by,
                ans_date_time: req.body.ans_date_time,
                votes: 0,
                comments: []
            })
            ans.save();
            await Question.findByIdAndUpdate({_id: req.body.questionId}, { $push: { answers: ans._id }})
        } catch(error) { console.log(error)}
    }
    postAnswer();
})

app.post('/incQVote', async(req, res) => { await Question.findByIdAndUpdate({_id: req.body.qid}, {$inc: { votes: 1}}) })
app.post('/decQVote', async(req, res) => { await Question.findByIdAndUpdate({_id: req.body.qid}, {$inc: { votes: -1}}) })
app.post('/incAVote', async(req, res) => { await Answer.findByIdAndUpdate({_id: req.body.aid}, {$inc: { votes: 1}}) })
app.post('/decAVote', async(req, res) => { await Answer.findByIdAndUpdate({_id: req.body.aid}, {$inc: { votes: -1}}) })
app.post('/incCVote', async(req, res) => { await Comment.findByIdAndUpdate({_id: req.body.cid}, {$inc: { votes: 1}}) })
app.post('/decCVote', async(req, res) => { await Comment.findByIdAndUpdate({_id: req.body.cid}, {$inc: { votes: -1}}) })
app.post('/incrementView', async(req, res) => { await Question.findByIdAndUpdate({_id: req.body.qid}, {$inc: { views: 1}}) })

app.post('/postQComment', (req, res) => {
    async function postComment() {
        try {
            const com = new Comment({
                text: req.body.text,
                com_by: req.body.com_by,
                com_date_time: req.body.com_date_time,
                votes: 0
            })
            com.save();
            await Question.findByIdAndUpdate({_id: req.body.qid}, { $push: { comments: com._id }})
            res.status(200).send();
        } catch(error) { console.log(error) }
    }
    postComment();
})

app.post('/postAComment', (req, res) => {
    async function postComment() {
        try {
            const com = new Comment({
                text: req.body.text,
                com_by: req.body.com_by,
                com_date_time: req.body.com_date_time,
                votes: 0
            })
            com.save();
            await Answer.findByIdAndUpdate({_id: req.body.aid}, { $push: { comments: com._id }})
        } catch(error) { console.log(error) }
    }
    postComment();
})

/*
    HELPER FUNCTIONS
*/

async function hashPassword(password) {
    return bcrypt.genSalt(10)
        .then(async salt => {
            return await bcrypt.hash(password, salt)
        })
}

/*
    This will now be the format of all questions sent from the server to the client.
    We are essentially taking all of the data received from the database and reformatting
    it to return an array of questions that follow the structure of questions in the old
    model.js. 
    Other things such as formatAnswers in the future could be here too. - Torin
*/
function formatQuestions(questions) {
    for(let i = 0; i < questions.length; i++) {
        let q = questions[i];

        questions[i] = {
            qid: q._id,
            title: q.title,
            summary: q.summary,
            text: q.text,
            tagIds: q.tags,
            askedBy: q.asked_by,
            askDate: q.ask_date_time,
            ansIds: q.answers,
            views: q.views,
            votes: q.votes,
            comments: q.comments
        }
    }
    return questions;
}

function formatAnswers(answers) {
    for(let i = 0; i < answers.length; i++) {
        let a = answers[i];
        answers[i] = {
            aid: a._id,
            text: a.text,
            ansBy: a.ans_by,
            ansDate: a.ans_date_time,
            votes: a.votes,
            comments: a.comments
        }
    }
    return answers;
}

function formatTags(tags) {
    for(let i = 0; i < tags.length; i++) {
        let t = tags[i];
        tags[i] = {
            tid: t._id,
            name: t.name
        }
    }
    return tags;
}

function formatComments(comments) {
    for(let i = 0; i < comments.length; i++) {
        let c = comments[i];
        comments[i] = {
            cid: c._id,
            text: c.text,
            comBy: c.com_by,
            comDate: c.com_date_time,
            votes: c.votes
        }
    }
    return comments;
}

// Upon closing server (Ctrl + C)
process.on('SIGINT', () => {
    console.log('\nServer closed. Database instance disconnected.');
    mongoose.connection.close();
    mongoose.connection.once('close', () => {
        server.close(() => { process.exit(0); })
    })
})
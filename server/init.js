// Start the mongoDB service as a background process before running the script (instructions in README.md)
const bcrypt = require('bcrypt');
let userArgs = process.argv.slice(2);

if (userArgs.length < 2) {
    console.log('Usage: node init.js <admin_email> <admin_password>');
    return
}

/**
 * Extra code has been put in this file in order to implement users and comments.
 */
let User = require('./models/users')
let Comment = require('./models/comments')
let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')


let mongoose = require('mongoose');
let mongoDB = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.dropDatabase();

async function userCreate(username, email, password, role, reputation) {
  const passwordHash = await bcrypt.genSalt(10).then(async salt => { return await bcrypt.hash(password, salt)});
  userdetail = {
    username: username,
    email: email,
    passwordHash: passwordHash,
    role: 'STANDARD_USER',
    reputation: 0,
    timeJoined: new Date()
  }
  if(role != false) userdetail.role = role;
  if(reputation != false) userdetail.reputation = reputation;
  let user = new User(userdetail);
  return user.save();
}

function commentCreate(text, com_by) {
  commentDetail = {
    text: text,
    posted_by: com_by,
    com_date_time: new Date(),
    votes: 0
  }
  let comment = new Comment(commentDetail);
  return comment.save();
}

function tagCreate(name, creator) {
  let tag = new Tag({name: name, created_by: creator});
  return tag.save();
}

function answerCreate(text, ans_by, ans_date_time, comments) {
  answerdetail = {text:text};
  if (ans_by != false) answerdetail.posted_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;
  if (comments != false) answerdetail.comments = comments;

  let answer = new Answer(answerdetail);
  return answer.save();
}

function questionCreate(title, summary, text, tags, answers, asked_by, ask_date_time, views, comments) {
  qstndetail = {
    title: title,
    summary: summary,
    text: text,
    tags: tags,
    posted_by: asked_by
  }
  if (answers != false) qstndetail.answers = answers;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if(views != false) qstndetail.views = views;
  if (comments != false) qstndetail.comments = comments;

  let qstn = new Question(qstndetail);
  return qstn.save();
}

const populate = async () => {
  const admin = await userCreate('Admin', userArgs[0], userArgs[1], 'ADMIN', 9999);
  let u1 = await userCreate('hamkalo', 'hamkalo@gmail.com', '123', false, false)
  let u2 = await userCreate('azad', 'azad@gmail.com', '123', false, false)
  let u3 = await userCreate('abaya', 'abaya@gmail.com', '123', false, false)
  let u4 = await userCreate('alia', 'alia@gmail.com', '123', false, false)
  let u5 = await userCreate('sana', 'sana@gmail.com', '123', false, false)
  let u6 = await userCreate('Joji John', 'jojijohn@gmail.com', '123', false, false)
  let u7 = await userCreate('saltyPeter', 'saltypeter@gmail.com', '123', false, false)
  let c1 = await commentCreate('This is a comment :)', u1)
  let c2 = await commentCreate('Good post! 1 Reddit Gold for you.', u7)
  let c3 = await commentCreate('I\'m sorry, I really don\'t know what you mean by this...', u4)
  let c4 = await commentCreate('Just google it lol', u2)
  let c5 = await commentCreate('Thank you all for the feedback!', u6)
  let c6 = await commentCreate('Please help me guys.........', u3)
  let c7 = await commentCreate('chatgpt\'s a thing yknow', u5)
  let c8 = await commentCreate('Good post! 1 Reddit Gold for you.', u7)
  let c9 = await commentCreate('Good post! 1 Reddit Gold for you.', u7)
  let c10 = await commentCreate('Sorry for spam.', u7)
  let t1 = await tagCreate('react', u6);
  let t2 = await tagCreate('javascript', u7);
  let t3 = await tagCreate('android', u7);
  let t4 = await tagCreate('preferences', u7);
  let t5 = await tagCreate('python', u3);
  let t6 = await tagCreate('mongodb', u5)
  let a1 = await answerCreate('React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.\nhistory for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.',
    u1, false);
  let a2 = await answerCreate('On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.',
    u2, false, [c5]);
  let a3 = await answerCreate('Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.',
    u3, false);
  let a4 = await answerCreate('YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);',
    u4, false);
  let a5 = await answerCreate('I just found all the above examples just too confusing, so I wrote my own.',
    u5, false);
  let a6 = await answerCreate('I just found all the above examples just too confusing, so I wrote my own.',
    u5, false);
  let a7 = await answerCreate('I just found all the above examples just too confusing, so I wrote my own.',
    u5, false);
  let a8 = await answerCreate('ok sana we get it already!!!!!!!',
    u1, false);
  await questionCreate('Lorem ipsum dolor sit amet', 'consectetur adipiscing elit', 'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    [t3, t4], false, u4, false, false, false)
  await questionCreate('Python question', 'making a function', 'need help making a function in python. i tried watching [this video](https://www.youtube.com/watch?v=yivyNCtVVDk) and [this one](https://www.youtube.com/watch?v=Kn1HF3oD19c) but to no avail.',
  [t5], false, u2, false, false, false)
  await questionCreate('How do I install MongoDB?', 'need help pls', 'i dont understand how to install mongodb, how do i run it in the terminal so i can use it with my react website?',
    [t1, t6], false, u5, false, false, [c4])
  await questionCreate('Python installation assistance', 'Can someone help me install Python?', 'This might be a dumb question sorry in advance. But what options do I choose in the [Python](https://www.python.org/) installation executable? This is confusing to me.',
    [t5], false, u3, false, 799, [c6]);
  await questionCreate('Programmatically navigate using React router', 'Need help with React router.', 'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.',
    [t1, t2], [a1, a2], u6, false, false, [c3, c7]);
  await questionCreate('android studio save string shared preference, start activity and load the saved string', 'How do I use saved strings with android studio?', 'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.',
    [t3, t4, t2], [a3, a4, a5, a6, a7, a8], u7, false, 121, [c1, c2, c8, c9, c10]);
  if(db) db.close();
  console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');

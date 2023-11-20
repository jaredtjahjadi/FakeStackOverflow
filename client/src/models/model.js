export default class Model {
  constructor() {
    this.data = {
      questions: [
                  {
                    qid: 'q1',
                    title: 'Programmatically navigate using React router',
                    text: 'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.',
                    tagIds: ['t1', 't2'],
                    askedBy : 'JoJi John',
                    askDate: new Date('December 17, 2020 03:24:00'),
                    ansIds: ['a1', 'a2', 'a3'],
                    views: 10,
                  },
                  {
                    qid: 'q2',
                    title: 'android studio save string shared preference, start activity and load the saved string',
                    text: 'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.',
                    tagIds: ['t3', 't4', 't2'],
                    askedBy : 'saltyPeter',
                    askDate: new Date('January 01, 2022 21:06:12'),
                    ansIds: ['a4', 'a3', 'a5'],
                    views: 121,
                  }
                ],
      tags: [
        {
          tid: 't1',
          name: 'react',
        },
        {
          tid: 't2',
          name: 'javascript',
        },
        {
          tid: 't3',
          name: 'android-studio',
        },
        {
          tid: 't4',
          name: 'shared-preferences',
        }
      ],

      answers: [
        {
          aid: 'a1',
          text: 'React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.',
          ansBy: 'hamkalo',
          ansDate: new Date('March 02, 2022 15:30:00'),
        },
        {
          aid: 'a2',
          text: 'On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.',
          ansBy: 'azad',
          ansDate: new Date('January 31, 2022 15:30:00'),
        },
        {
          aid: 'a3',
          text: 'Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.',
          ansBy: 'abaya',
          ansDate: new Date('April 21, 2022 15:25:22'),
        },
        {
          aid: 'a4',
          text: 'YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);',
          ansBy: 'alia',
          ansDate: new Date('December 02, 2022 02:20:59'),
        },
        {
          aid: 'a5',
          text: 'I just found all the above examples just too confusing, so I wrote my own. ',
          ansBy: 'sana',
          ansDate: new Date('December 31, 2022 20:20:59'),
        }
      ]
    };
  }
  // GETTERS

  get questions() { return this.data.questions; }
  get answers() { return this.data.answers; }
  get tags() { return this.data.tags; }

  /**
   * Fetches the question associated with the given question ID.
   * 
   * @param {string} qid the id of the question to find
   * @returns The question associated with the given question ID
   */

  getQuestion(qid) {

    for(let q of this.questions) {
      if(q.qid === qid)
        return q;
    }

    return null;
  }

  getAnswer(aid) {

    for(let a of this.data.answers) {
      if(a.aid === aid)
        return a;
    }

    return null;
  }

  /**
   * Fetches the tags associated with the given tag IDs.
   * 
   * @param {const} ids an array of tag IDs
   * @returns An array of tags associated with the given tag IDs
   */

  getTags(ids) {

    function findTags(tag) {
      return ids.includes(tag.tid);
    }

    return this.data.tags.filter(findTags);
  }

  /**
   * Fetches the answers associated with the given answer IDs.
   * 
   * @param {const} ids an array of answer IDs
   * @returns An array of answers associated with the given answer IDs
   */

  getAnswers(ids) {

    // function findAnswers(answer) {
    //   return ids.includes(answer.aid);
    // }

    // return this.data.answers.filter(findAnswers);

    let answers = [];

    for(let i = 0; i < ids.length; i++) {
      answers.push(this.getAnswer(ids[i]))
    }

    return answers;
  }

  getUnansweredQuestions() {
    let unansweredQuestions = [];

    for(let q of this.data.questions) {
      if(q.ansIds === 0)
        unansweredQuestions.push(q);
    }

    return unansweredQuestions;
  }

  getMatchingSearches(tags, keywords) {

    let matching_searches = [];

    for(let q of this.sortQuestionsByDate()) {
      let curr_tags = this.getTags(q.tagIds);
      if(curr_tags.some(t => tags.includes(t.name.toLowerCase())))
        matching_searches.push(q);

      else if(keywords.some(k => q.title.toLowerCase().indexOf(k.toLowerCase()) > -1 || q.text.toLowerCase().indexOf(k.toLowerCase()) > -1))
        matching_searches.push(q);
    }

    return matching_searches;
  }

  sortQuestionsByDate() {
    function compare(q1, q2) {
      return q2.askDate - q1.askDate;
    }

    return this.data.questions.slice(0).sort(compare)
  }

  sortQuestionAIDsByDate(question) {
    function compare(a1, a2) {
      return a2.ansDate - a1.ansDate
    }

    let answers = this.getAnswers(question.ansIds);
    console.log(answers)
    answers.sort(compare);
    for(let i = 0; i < question.ansIds.length; i++)
      question.ansIds[i] = answers[i].aid;

    return question;
  }

  sortQuestionsByActivity() {
    const m = this;

    function compareQuestionActivity(q1, q2) {
      if(q1.ansIds.length === 0 && q2.ansIds.length === 0)
        return 0;
      else if(q1.ansIds.length === 0)
        return 1;
      else if(q2.ansIds.length === 0)
        return -1;
      else {
        let q1_sorted = m.sortQuestionAIDsByDate(q1);
        let q2_sorted = m.sortQuestionAIDsByDate(q2);
        let q1_last_answer = m.getAnswer(q1_sorted.ansIds[0]);
        let q2_last_answer = m.getAnswer(q2_sorted.ansIds[0]);
        return q2_last_answer.ansDate - q1_last_answer.ansDate;
      }
    }

    return this.data.questions.slice(0).sort(compareQuestionActivity);
  }

  increaseViews(question) {
    question.views++;
  }

  //--------------------------------------------------------------------
  // Find tag in tags field based on string. Return true if found, false if not.
  getTagId(tag) {
    for(let i = 0; i < this.tags.length; i++) if(this.tags[i].name === tag) return this.tags[i].tid;
    return null;
  }

  // Get number of tags
  numTags() { return this.data.tags.length; }

  addQuestion(title, text, tagStrs, username, date) {
    const numQuestions = this.data.questions.length;
    const tagIds = [];
    for(let i = 0; i < tagStrs.length; i++) {
      let tid = this.getTagId(tagStrs[i]);
      if(tid == null) {
        this.addTag(tagStrs[i]);
        tagIds[i] = "t" + (this.data.tags.length);
      }
      else tagIds[i] = tid;
    }
    this.data.questions.push({
      qid: "q" + (numQuestions + 1),
      title: title,
      text: text,
      tagIds: tagIds,
      askedBy: username,
      askDate: date,
      ansIds: [],
      views: 0
    });
    return true;
  }

  addTag(tagName) { this.data.tags.push({ tid: "t" + (this.numTags() + 1), name: tagName }); }

  questionsWithTag(tag) {
    const qWithTag = [];
    // Iterate through each question
    for(let q of this.questions) {
      // Iterate through each of the question's tag IDs
      for(let qTagId of q.tagIds) {
        // If the provided tag's ID matches the question's current tag ID
        if(tag.tid === qTagId) {
          qWithTag.push(q);
          break;
        }
      }
    }
    return qWithTag;
}

  addAnswer(question, text, username, date) {
    const numAns = this.data.answers.length;
    this.answers.push({
      aid: "a" + (numAns + 1),
      text: text,
      ansBy: username,
      ansDate: date
    });
    question.ansIds.push("a" + (numAns + 1));
    return true;
  }
}

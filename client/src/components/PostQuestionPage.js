import { useContext } from 'react';
import FormField from './FormField';
import * as Constants from '../constants';
// import { model } from './fakestackoverflow';
import { QuestionsInfo } from './HomePage';
import axios from 'axios'

const emptyFieldStr = "This field must be filled out."
let validForm = false;

export default function PostQuestionPage() {
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrPage = questionsInfo.setCurrPage;
    const setCurrFilter = questionsInfo.setCurrFilter;
    // const setDisplayedQuestions = questionsInfo.setDisplayedQuestions;
    // const setNumQuestions = questionsInfo.setNumQuestions;

    return (
        <div id="new-question">
            <form id="new-question-form" name="new-question" onSubmit={(event) => {
                validForm = false;
                handleSubmit(event);
                if(validForm) {
                    setCurrPage(Constants.QUESTIONS_PAGE);
                    setCurrFilter(Constants.NEWEST_FILTER);
                    // let questions = model.sortQuestionsByDate();
                    // setDisplayedQuestions(questions);
                    // setNumQuestions(questions.length);
                }
            }}>
                <FormField
                    id="question-title"
                    title="Question Title"
                    instrs="Limit title to 100 characters or less"
                    input={true}
                    name='title'
                />
                <div id="error-message" />
                <FormField
                    id="question-text"
                    title="Question Text"
                    instrs="Add details"
                    input={false}
                    name='qtext'
                />
                <FormField
                    id="question-tags"
                    title="Tags"
                    instrs="Add keywords separated by whitespace"
                    input={true}
                    name='tags'
                />
                <FormField
                    id="question-username"
                    title="Username"
                    input={true}
                    name='quser'
                />
                <div id="end-form">
                    <input className="submit-button" type="submit" value="Post Question" />
                    <div id="mandatory-fields">* indicates mandatory fields</div>
                </div>
            </form>
        </div>
    )
}

function handleSubmit(event) {
    let errMsg = document.getElementById("error-message");
    errMsg.innerHTML = "";
    let questionTitle = event.target.title.value.trim();
    let questionTagStr = event.target.tags.value.trim();
    let inputTags = questionTagStr.split(" ");
    const questionTags = [];
    inputTags.forEach(inputTag => { if(inputTag !== "") questionTags.push(inputTag.toLowerCase()); });
    let questionText = event.target.qtext.value.trim();
    let questionUsername = event.target.quser.value.trim();
    let currDate = new Date();

    // Title verification (ensure title is no more than 100 characters)
    document.getElementById("question-title").appendChild(errMsg);
    if(questionTitle.length === 0) return invalidForm(emptyFieldStr, event);
    if(questionTitle.length > 100) return invalidForm("Question title must be no more than 100 characters.", event);

    // Text verification
    document.getElementById("question-text").appendChild(errMsg);
    if(questionText.length === 0) return invalidForm(emptyFieldStr, event);
    // Check if hyperlinks, if any, in text are valid
    const tokens = questionText.match(/\[[^\]]*\]\([^)]*\)/g); // [...](...). "..." = anything (including empty string)
    const regex = /\[.+?\]\((https:\/\/|http:\/\/)[^)](.*?)\)/g; // [text](link)
    if(tokens){
        for(let token of tokens) { if(!regex.test(token)) return invalidForm("Hyperlink in question text invalid. Must be of the form [text](link).", event); }
    }

    // Tag verification
    document.getElementById("question-tags").appendChild(errMsg);
    if(questionTagStr.length === 0) return invalidForm(emptyFieldStr, event);
    if(questionTags.length > 5) return invalidForm("No more than five tags for one question.", event); // Ensure there are no more than 5 tags

    // Ensure tag is no more than 10 characters
    for(var i = 0; i < questionTags.length; i++) {
        let lower = questionTags[i].toLowerCase();
        if(lower !== "shared-preferences" || lower !== "web-scripting" || lower !== "android-studio") {
            if(lower.length > 10) return invalidForm("Tag length must be no more than 10 characters.", event);
        }
    }

    document.getElementById("question-username").appendChild(errMsg);
    if(questionUsername.length === 0) return invalidForm(emptyFieldStr, event);

    // Form validation has passed
    // Add question to model data

    const addQuestion = async () => {
        try {
            const questionData = {
                title: questionTitle,
                text: questionText,
                tags: questionTags,
                answers: [],
                asked_by: questionUsername,
                ask_date_time: currDate,
                views: 0,
                votes: 0
            }

            await axios.post('http://localhost:8000/addQuestion', questionData)
        } catch (error) {
            console.log(error)
        }
    }

    addQuestion()
    event.preventDefault(); // Do not reload page after clicking submit button
    document.getElementById("new-question-form").reset(); // Clear form fields
    errMsg.innerHTML = "";
    validForm = true;
}

export function invalidForm(message, event) {
    event.preventDefault();
    document.getElementById("error-message").innerHTML = message;
    return false;
}


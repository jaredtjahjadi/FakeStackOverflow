import React, { useContext } from 'react';
import * as Constants from '../constants';
import FormField from './FormField';
import { QuestionsInfo } from './HomePage';
import { invalidForm } from './PostQuestionPage';
import axios from 'axios';

const emptyFieldStr = "This field must be filled out."
let validForm = false;

export default function PostAnswerPage() {
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrPage = questionsInfo.setCurrPage;
    const currDisplayedQuestion = questionsInfo.currDisplayedQuestion;
    return (
        <div id="new-answer">
            <form id="new-answer-form" name="new-answer" onSubmit={(event) => {
                validForm = false;
                handleSubmit(event, currDisplayedQuestion);
                if(validForm) {
                    // Form validation has passed
                    // Add answer to model data
                    setCurrPage(Constants.SEE_ANSWERS_PAGE);
                }
            }}>
                <FormField input={true} id="ans-username" title="Username" name="ansuser" />
                <div id="error-message" />
                <FormField input={false} id="ans-text" title="Answer Text" name="anstext" />
                <div id="end-form">
                    <input className="submit-button" type="submit" value="Post Question" />
                    <div id="mandatory-fields">* indicates mandatory fields</div>
                </div>
            </form>
        </div>
    )
}

// TODO: Handle rendering of answers without having to refresh page
function handleSubmit(event, currQuestion) {
    let errMsg = document.getElementById("error-message");
    let ansUser = event.target.ansuser.value.trim();
    let ansText = event.target.anstext.value.trim();

    document.getElementById("ans-username").appendChild(errMsg);
    if(ansUser.length === 0) return invalidForm(emptyFieldStr, event);

    document.getElementById("ans-text").appendChild(errMsg);
    if(ansText.length === 0) return invalidForm(emptyFieldStr, event);
    // Check if hyperlinks, if any, in text are valid
    const tokens = ansText.match(/\[[^\]]*\]\([^)]*\)/g); // [...](...). "..." = anything (including empty string)
    const regex = /\[.+?\]\(\s*(https:\/\/|http:\/\/)[^)](.*?)\)/g; // [text](link)
    if(tokens) {
        for(let i = 0; i < tokens.length; i++) {
            if(!regex.test(tokens[i])) return invalidForm("Hyperlink in answer text invalid. Must be of the form [text](link).", event);
        }
    }
    const postAnswer = async() => {
        try {
            await axios.post('http://localhost:8000/postAnswer', {
                text: ansText,
                ans_by: ansUser,
                ans_date_time: new Date(),
                questionId: currQuestion.qid
            })
        } catch(error) { console.log(error)}
    }
    postAnswer()
    event.preventDefault();
    document.getElementById("new-answer-form").reset();
    errMsg.innerHTML = "";
    validForm = true;
}
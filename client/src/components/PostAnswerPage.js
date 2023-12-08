import React, { useContext, useState, useEffect } from 'react';
import * as Constants from '../constants';
import FormField from './FormField';
import { QuestionsInfo } from './HomePage';
import axios from 'axios';
import { ErrorMessage } from './PostQuestionPage';

export default function PostAnswerPage() {
    const emptyFieldStr = "This field must be filled out."
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrPage = questionsInfo.setCurrPage;
    const currDisplayedQuestion = questionsInfo.currDisplayedQuestion;
    const [formErrors, setFormErrors] = useState({});

    const [userInfo, setUserInfo] = useState(0);

    useEffect(() => {
        const getUserInfo = async () => {
            const userInfo = await axios.get('http://localhost:8000/userProfile')
            setUserInfo(userInfo.data)
        }
        getUserInfo()
    })

    const handleSubmit = async (event) => {
        event.preventDefault();
        const ansText = event.target.anstext.value.trim();
        const errors = validateForm({ansText});
        //If no errors in form (all fields are valid)
        if(Object.keys(errors).length === 0) {
            try {
                setCurrPage(Constants.SEE_ANSWERS_PAGE);
                event.target.reset();
                setFormErrors({});
                await axios.post('http://localhost:8000/postAnswer', {
                    text: ansText,
                    ans_date_time: new Date(),
                    questionId: currDisplayedQuestion.qid,
                    votes: 0,
                    comments: []
                })
            } catch(error) { console.log(error); }
        }
        else setFormErrors(errors);
    }

    const validateForm = ({ansText}) => {
        const errors = {}; 
        if(ansText.length === 0) errors.ansText = emptyFieldStr;
        const tokens = ansText.match(/\[[^\]]*\]\([^)]*\)/g); // [...](...). "..." = anything (including empty string)
        const regex = /\[.+?\]\(\s*(https:\/\/|http:\/\/)[^)](.*?)\)/g; // [text](link)
        if(tokens) {
            for(let token of tokens) if(!regex.test(token))
                errors.ansText = "Hyperlink in answer text invalid. Must be of the form [text](link).";
        }
        return errors;
    }
    
    return (
        <div id="new-answer">
            <form id="new-answer-form" name="new-answer" onSubmit={handleSubmit}>
                <FormField input={false} id="ans-text" title="Answer Text" name="anstext" />
                {formErrors.ansText && <ErrorMessage errMsg={formErrors.ansText} />}
                <div id="end-form">
                    <input className="submit-button" type="submit" value="Post Question" />
                    <div id="mandatory-fields">* indicates mandatory fields</div>
                </div>
            </form>
        </div>
    )
}
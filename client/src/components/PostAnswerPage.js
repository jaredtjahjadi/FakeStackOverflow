import React, { useContext, useState, useEffect } from 'react';
import * as Constants from '../constants';
import FormField from './FormField';
import { QuestionsInfo } from './HomePage';
import axios from 'axios';
import { ErrorMessage } from './PostQuestionPage';

export default function PostAnswerPage({answer}) {
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrPage = questionsInfo.setCurrPage;
    const currDisplayedPost = questionsInfo.currDisplayedPost;
    const [formErrors, setFormErrors] = useState({});
    const [answerText, setAnswerText] = useState('')

    useEffect(() => {if(answer) setAnswerText(answer.text)}, [answer])

    const handleSubmit = async (event) => {
        event.preventDefault();
        const ansText = event.target.anstext.value.trim();
        const errors = validateForm({ansText});
        //If no errors in form (all fields are valid)
        if(Object.keys(errors).length === 0) {
            try {
                if(answerText) {
                    await axios.post('http://localhost:8000/modifyAnswer', {
                        text: ansText,
                        aid: currDisplayedPost.aid,
                    })

                    event.target.reset();
                    setFormErrors({});
                    setCurrPage(Constants.USER_PROFILE);
                }
                else {
                    await axios.post('http://localhost:8000/postAnswer', {
                        text: ansText,
                        ans_date_time: new Date(),
                        questionId: currDisplayedPost.qid,
                        votes: 0,
                        comments: []
                    })

                    event.target.reset();
                    setFormErrors({});
                    setCurrPage(Constants.QUESTIONS_PAGE);
                }
            } catch(error) { console.log(error); }
        }
        else setFormErrors(errors);
    }

    const validateForm = ({ansText}) => {
        const errors = {}; 
        if(ansText.length === 0) errors.ansText = Constants.EMPTY_FIELD_ERROR;
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
                <FormField 
                    input={false} 
                    id="ans-text" 
                    title="Answer Text" 
                    name="anstext" 
                    value={answerText ? answerText : null}
                    onChange={answerText ? (event) => setAnswerText(event.target.value) : null}
                />
                {formErrors.ansText && <ErrorMessage errMsg={formErrors.ansText} />}
                <div id="end-form">
                    <input className="submit-button" type="submit" value="Post Answer" />
                    <div id="mandatory-fields">* indicates mandatory fields</div>
                </div>
            </form>
        </div>
    )
}
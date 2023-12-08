import React, { useContext, useEffect, Fragment, useState } from 'react';
import { QuestionsInfo } from './HomePage';
import { AskQuestion } from './body';
import { DateMetadata, splitArray } from './QuestionsPage';
import * as Constants from '../constants';
import axios from 'axios';
import { Text } from './SeeAnswers';
import Comments from './Comments';
import { AnswerNav } from './SeeAnswers';

export function SeeUserAnswers() {
    const questionInfo = useContext(QuestionsInfo)
    const currDisplayedQuestion = questionInfo.currDisplayedQuestion;
    const setCurrPage = questionInfo.setCurrPage;
    const [answers, setAnswers] = useState([]);
    const [currDisplayedAnswers, setDisplayedAnswers] = useState([]);

    console.log(currDisplayedQuestion)
    useEffect(() => {
        const getAnswers = async() => {
            try {
                console.log(currDisplayedQuestion)
                const res = await axios.get(`http://localhost:8000/userAnswers/${currDisplayedQuestion.qid}`)
                console.log(res)
            } catch(error) { console.log(error) }
        }

        getAnswers()
    })

    return (
        <div id='see-answers-page'>
            <div id='question-metadata-container'>
                <div id='question-metadata-top'>
                    <div id='num-answers'>{currDisplayedQuestion.ansIds.length} answers</div>
                </div>
                <div id='question-metadata-bottom'>
                    <div id='num-views'>{currDisplayedQuestion.views} views</div>
                    <div id='question-metadata-text'><Text text={currDisplayedQuestion.text} /></div>
                    <div id='asked-by'><DateMetadata question={currDisplayedQuestion} /></div>
                </div>
            </div>
            <div id='answers'>{currDisplayedAnswers.map((ans) => <Answer key={ans.aid} answer={ans} />)}</div>
            {answers.length > 5 && <AnswerNav ans={answers} setDisplayedAnswers={setDisplayedAnswers} />}
        </div>
    )
}

function Answer({answer}) {
    return (
        <div>
            <div id={answer.aid} className='answer-container'>
                <div className='answer-text'><Text text={answer.text} /></div>
                <DateMetadata answer={answer} />
            </div>
        </div>
    )
}
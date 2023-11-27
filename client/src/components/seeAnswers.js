import React, { useContext, useEffect, useState } from 'react';
import { QuestionsInfo } from './HomePage';
import { AskQuestion } from './Body';
import { QuestionDateMetadata } from './test';
import * as Constants from '../constants';
import NavButtonContainer from './NavButtonContainer';
import axios from 'axios';

export function SeeAnswers() {
    const questionInfo = useContext(QuestionsInfo)
    const currDisplayedQuestion = questionInfo.currDisplayedQuestion;
    const setCurrPage = questionInfo.setCurrPage;

    // Retrieves answers for current question from server
    const [answers, setAnswers] = useState([]);
    useEffect(() => {
        let isMounted = true;
        const getAnswers = async() => {
            try {
                const res = await axios.get(`http://localhost:8000/answers/${currDisplayedQuestion.qid}`)
                if(isMounted) setAnswers(res.data);
            } catch(error) { console.log(error) }
        }
        getAnswers();

        return () => {isMounted = false; }
    }, [currDisplayedQuestion.qid])

    return (
        <div id='see-answers-page'>
            <div id='question-metadata-container'>
                <div id='question-metadata-top'>
                    <div id='num-answers'>{currDisplayedQuestion.ansIds.length} answers</div>
                    <p id='question-metadata-title'>{currDisplayedQuestion.title}</p>
                    <AskQuestion />
                </div>
                <div id='question-metadata-bottom'>
                    <div id='num-views'>{currDisplayedQuestion.views} views</div>
                    <div id='question-metadata-text'><Text text={currDisplayedQuestion.text} /></div>
                    <div id='asked-by'><QuestionDateMetadata question={currDisplayedQuestion} /></div>
                </div>
            </div>
            <div id='answers'>{answers.map((ans) => <Answer answer={ans} />)}</div>
            <div id='answer-question-container'>
                <button id='answer-question' onClick={() => setCurrPage(Constants.POST_ANSWER_PAGE)}>Answer Question</button>
            </div>
            <NavButtonContainer />
        </div>
    )
}

function Answer({answer}) {
    return (
        <div id={answer.aid} className='answer-container'>
            <div className='answer-text'><Text text={answer.text} /></div>
            <div className='answer-metadata'><AnswerDateMetadata answer={answer}/></div>
        </div>
    )
}

export function Text(props) {

    let text = props.text;
    let tokens = text.match(/(\[.+?\]\((https:\/\/|http:\/\/)[^)](.*?)\))|\s?\w+\s?|\s?.+?\s?/g);
    const regex = /\[.+?\]\((https:\/\/|http:\/\/)[^)](.*?)\)/g;

    for(let i = 0; i < tokens.length; i++) {
        let currToken = tokens[i];
        if(regex.test(currToken)) tokens[i] = <Hyperlink token={tokens[i]}/>
        else tokens[i] = <>{tokens[i]}</>
    }

    return <p>{tokens}</p>
}

function Hyperlink(props) {
    let token = props.token;
    let title = token.slice(1, token.indexOf(']'))
    let refBegin = token.indexOf(']') + 2;
    let refEnd = token.indexOf(')', refBegin);
    let ref = token.slice(refBegin, refEnd);

    return <a href={ref} target="_blank" rel="noreferrer">{title}</a>
}

function AnswerDateMetadata(props) {
    let a = props.answer;
    let time_now = new Date();
    let time_answered = new Date(a.ansDate);

    // Years ago
    if(time_now - time_answered > 1000 * 60 * 60 * 24 * 365)
        return (
            <p>
                {a.ansBy + " answered " + time_answered.toLocaleString('en-US', { month: 'long', day: 'numeric', 
                    year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false})}
            </p>
        )

    // Days ago
    else if(time_now - time_answered > 1000 * 60 * 60 * 24)
        return (
            <p>
                {a.ansBy + " answered " + time_answered.toLocaleString('en-US', { month: 'long' }) + " " + time_answered.getDate() + 
                    " at " + time_answered.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}
            </p>
        )

    // Hours ago
    else if(time_now - time_answered > 1000 * 60 * 60) return <p>{a.ansBy + " answered " + Math.round((time_now - time_answered)/(1000 * 60 * 60)) + " hours ago"}</p>

    // Minutes ago
    else if(time_now - time_answered > 1000 * 60) return <p>{a.ansBy + " answered " + Math.round((time_now - time_answered)/(1000 * 60)) + " minutes ago"}</p>

    // Seconds ago
    else return <p>{a.ansBy + " answered " + Math.round((time_now - time_answered)/(1000)) + " seconds ago"}</p>
}
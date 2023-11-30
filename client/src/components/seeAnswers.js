import React, { useContext, useEffect, Fragment } from 'react';
import { QuestionsInfo } from './HomePage';
import { AskQuestion } from './Body';
import { QuestionDateMetadata, splitArray } from './QuestionsPage';
import * as Constants from '../constants';
import axios from 'axios';

let answerChunkInd = 0;

export function SeeAnswers() {
    const questionInfo = useContext(QuestionsInfo)
    const currDisplayedQuestion = questionInfo.currDisplayedQuestion;
    const setCurrPage = questionInfo.setCurrPage;
    const answers = questionInfo.allAnswers;
    const setAnswers = questionInfo.setAllAnswers;
    const currDisplayedAnswers = questionInfo.currDisplayedAnswers;
    const setDisplayedAnswers = questionInfo.setDisplayedAnswers;

    // Retrieves answers for current question from server
    useEffect(() => {
        let isMounted = true;
        const getAnswers = async() => {
            try {
                const res = await axios.get(`http://localhost:8000/answers/${currDisplayedQuestion.qid}`)
                if(isMounted) {
                    setAnswers(res.data);
                    setDisplayedAnswers(res.data.slice(0, 5));
                    answerChunkInd = 0;
                }
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
            <div id='answers'>{currDisplayedAnswers.map((ans) => <Answer key={ans.aid} answer={ans} />)}</div>
            <div id='answer-question-container'>
                <button id='answer-question' onClick={() => setCurrPage(Constants.POST_ANSWER_PAGE)}>Answer Question</button>
            </div>
            {answers.length > 5 && <AnswerNav ans={answers} setDisplayedAnswers={setDisplayedAnswers} />}
        </div>
    )
}

function Answer({answer}) {
    return (
        <div id={answer.aid} className='answer-container'>
            <div className="votes">
                <p className="upvote" onClick={() => {
                    const incQVote = async() => {
                        try { await axios.post('http://localhost:8000/incAVote', answer) }
                        catch(error) { console.log(error) }
                    }
                    incQVote();
                }}>🡅</p>
                {answer.votes}
                <p className="downvote" onClick={() => {
                    const decQVote = async() => {
                        try { await axios.post('http://localhost:8000/decAVote', answer) }
                        catch(error) { console.log(error) }
                    }
                    decQVote();
                }}>🡇</p>
            </div>
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
        if(regex.test(currToken)) tokens[i] = <Hyperlink key={i} token={tokens[i]}/>
        else tokens[i] = <Fragment key={i}>{tokens[i]}</Fragment>
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
    const a = props.answer;
    const time_now = new Date();
    const time_answered = new Date(a.ansDate);
    const time_ago = time_now - time_answered;
    const minutes_ago = 1000 * 60;
    const hours_ago = minutes_ago * 60;
    const days_ago = hours_ago * 24;
    const years_ago = days_ago * 365;
    let ans_time = "";
    if(time_ago > years_ago) ans_time = a.ansBy + " answered " + time_answered.toLocaleString('en-US', { month: 'long', day: 'numeric', 
        year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false});
    else if(time_ago > days_ago) ans_time = a.ansBy + " answered " + time_answered.toLocaleString('en-US', { month: 'long' }) + " " + time_answered.getDate() + 
        " at " + time_answered.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false});
    else if(time_ago > hours_ago) ans_time = a.ansBy + " answered " + Math.round((time_now - time_answered)/(1000 * 60 * 60)) + " hours ago";
    else if(time_ago > minutes_ago) ans_time = a.ansBy + " answered " + Math.round((time_now - time_answered)/(1000 * 60)) + " minutes ago";
    else ans_time = a.ansBy + " answered " + Math.round((time_now - time_answered)/(1000)) + " seconds ago";
    return <p>{ans_time}</p>
}

export function AnswerNav(props) {
    const answerChunks = splitArray(props.ans);
    const setDisplayedAnswers = props.setDisplayedAnswers;
    
    return (
        <div id="nav-button-container">
            <div id="prev-button" onClick={() => {
                if(answerChunkInd > 0) {
                    answerChunkInd--;
                    setDisplayedAnswers(answerChunks[answerChunkInd]);
                }
            }}>◄ Prev</div>
            <div id="next-button" onClick={() => {
                if(answerChunkInd < answerChunks.length - 1) {
                    answerChunkInd++;
                    setDisplayedAnswers(answerChunks[answerChunkInd]);
                }
            }}>Next ►</div>
        </div>
    )
}
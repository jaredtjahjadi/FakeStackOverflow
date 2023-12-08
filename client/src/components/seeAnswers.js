import React, { useContext, useEffect, Fragment, useState } from 'react';
import { QuestionsInfo } from './HomePage';
import { AskQuestion } from './body';
import { DateMetadata, splitArray } from './QuestionsPage';
import * as Constants from '../constants';
import axios from 'axios';
import Comments from './Comments';

let answerChunkInd = 0;

export function SeeAnswers() {
    const questionInfo = useContext(QuestionsInfo)
    const currDisplayedQuestion = questionInfo.currDisplayedQuestion;
    const setCurrPage = questionInfo.setCurrPage;
    const [answers, setAnswers] = useState([]);
    const [currDisplayedAnswers, setDisplayedAnswers] = useState([]);
    const [username, setUsername] = useState('');

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

        return () => { isMounted = false; }
    }, [currDisplayedQuestion, answers])

    useEffect(() => {
        const getQuestionUserData = async () => {
            await axios.get('http://localhost:8000/userData', {params: currDisplayedQuestion })
            .then(res => { setUsername(res.data) })
        }
        getQuestionUserData();
    }, [currDisplayedQuestion])

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
                    <div id='asked-by'><DateMetadata question={currDisplayedQuestion} user={username} /></div>
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
    const [username, setUsername] = useState('');
    useEffect(() => {
        const getAnswerUsername = async () => {
            await axios.get('http://localhost:8000/userData', {params: answer })
            .then(res => { setUsername(res.data) })
        }
        getAnswerUsername();
    }, [answer])
    return (
        <div>
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
                <DateMetadata answer={answer} user={username} />
            </div>
            <Comments answer={answer} />
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

function AnswerNav(props) {
    const answerChunks = splitArray(props.ans, 5);
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
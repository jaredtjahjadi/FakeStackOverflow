import React, { useContext, useEffect, Fragment, useState } from 'react';
import { QuestionsInfo } from './HomePage';
import { AskQuestion } from './body';
import { DateMetadata, splitArray } from './QuestionsPage';
import * as Constants from '../constants';
import axios from 'axios';
import Comments from './Comments';

let answerChunkInd = 0;

export function SeeAnswers() {
    const questionsInfo = useContext(QuestionsInfo)
    const currDisplayedPost = questionsInfo.currDisplayedPost;
    const setCurrPage = questionsInfo.setCurrPage;
    const setDisplayedPost = questionsInfo.setDisplayedPost
    const isAuthenticated = questionsInfo.isAuthenticated
    const [answers, setAnswers] = useState([]);
    const [currDisplayedAnswers, setDisplayedAnswers] = useState([]);
    const [username, setUsername] = useState('');
    /*
        This is the index before the user's answers end. It's used make a distinction for the
        user's answers from the rest of the answers associated with a question. It's used
        for each answer to decide whether we should give the user the option to modify
        a specific question or not. Check the /userFormattedAnswers route in server.js
        to see how I formatted it.
    */
    const [userAnswersEndInd, setUserAnswersEndInd] = useState(0)

    // Retrieves answers for current question from server
    useEffect(() => {
        let isMounted = true;
        const getAnswers = async() => {
            try {
                let res;

                if(questionsInfo.currPage === Constants.SEE_USER_ANSWERS_PAGE) {
                    res = await axios.get(`http://localhost:8000/userFormattedAnswers/${currDisplayedPost.qid}`)
                    setUserAnswersEndInd(res.data.userEndInd)
                    setDisplayedAnswers(res.data.answers.slice(0, 5));
                    setAnswers(res.data.answers);
                }

                else {
                    res = await axios.get(`http://localhost:8000/answers/${currDisplayedPost.qid}`)
                    setDisplayedAnswers(res.data.slice(0, 5));
                    setAnswers(res.data);
                }

                if(isMounted) answerChunkInd = 0;

            } catch(error) { console.log(error) }
        }
        getAnswers();

        return () => { isMounted = false; }
    }, [questionsInfo.currPage, currDisplayedPost.qid])

    useEffect(() => {
        const getAnswerUsername = async () => {
            await axios.get('http://localhost:8000/userData', {params: currDisplayedPost })
            .then(res => { setUsername(res.data) })
        }
        getAnswerUsername();
    }, [currDisplayedPost])

    return (
        <div id='see-answers-page'>
            <div id='question-metadata-container'>
                <div id='question-metadata-top'>
                    <div id='num-answers'>{currDisplayedPost ? currDisplayedPost.ansIds.length : 0} answers</div>
                    <p id='question-metadata-title'>{currDisplayedPost.title}</p>
                    {isAuthenticated ? <AskQuestion /> : <div/>}
                </div>
                <div id='question-metadata-bottom'>
                    <div id='num-views'>{currDisplayedPost.views} views</div>
                    <div id='question-metadata-text'><Text text={currDisplayedPost.text} /></div>
                    <div id='asked-by'><DateMetadata question={currDisplayedPost} user={username} /></div>
                </div>
            </div>
            <div id='answers'>{currDisplayedAnswers.map((ans, index) => <Answer key={ans.aid} answer={ans} setCurrPage={setCurrPage} 
                setDisplayedPost={setDisplayedPost} isUsers={index < userAnswersEndInd} setAnswers={setAnswers} answers={answers}/>)}</div>
            {isAuthenticated &&
                <div id='answer-question-container'>
                    <button id='answer-question' onClick={() => setCurrPage(Constants.POST_ANSWER_PAGE)}>Answer Question</button>
                </div>
            }
            {answers.length > 5 && <AnswerNav ans={answers} setDisplayedAnswers={setDisplayedAnswers} />}
        </div>
    )
}

function Answer({answer, setCurrPage, setDisplayedPost, isUsers, setAnswers, answers}) {
    const [username, setUsername] = useState('');
    const questionsInfo = useContext(QuestionsInfo)
    const isAuthenticated = questionsInfo.isAuthenticated

    const [votes, setVotes] = useState(answer.votes);

    useEffect(() => {
        const getAnswerUsername = async () => {
            await axios.get('http://localhost:8000/userData', {params: answer })
            .then(res => { setUsername(res.data) })
        }
        getAnswerUsername();
    }, [answer])
    return (
        <div>
            <div id={answer.aid} className="answer-container">
                <div className="votes">
                    <p className="upvote" onClick={() => {
                        if(!isAuthenticated) {
                            alert(Constants.GUEST_VOTE_ERROR)
                            return;
                        }
                        const incVote = async() => {
                            const a = answer;
                            a.votes++;
                            setVotes(a.votes);
                            try { await axios.post('http://localhost:8000/incVote', answer) }
                            catch(error) { console.log(error) }
                        }
                        incVote();
                    }}>🡅</p>
                    {votes}
                    <p className="downvote" onClick={() => {
                        if(!isAuthenticated) {
                            alert(Constants.GUEST_VOTE_ERROR)
                            return;
                        }
                        const decVote = async() => {
                            const a = answer;
                            a.votes--;
                            setVotes(a.votes);
                            try { await axios.post('http://localhost:8000/decVote', answer) }
                            catch(error) { console.log(error) }
                        }
                        decVote();
                    }}>🡇</p>
                </div>
                <div className='answer-text'><Text text={answer.text} /></div>
                <DateMetadata answer={answer} user={username} />
            </div>

            {questionsInfo.currPage !== Constants.SEE_USER_ANSWERS_PAGE && isAuthenticated && <Comments answer={answer} />}
            {questionsInfo.currPage === Constants.SEE_USER_ANSWERS_PAGE && isUsers &&
                <button className='modify-button' onClick={() => {
                    setCurrPage(Constants.MODIFY_ANSWER_PAGE)
                    setDisplayedPost(answer)
                }}>
                    Modify
                </button>
            }
            {questionsInfo.currPage === Constants.SEE_USER_ANSWERS_PAGE && isUsers &&
                <button className='modify-button' onClick={async () => {
                    await axios.post('http://localhost:8000/deleteAnswer', {aid: answer.aid})
                    setAnswers(answers.filter(ans => ans.aid !== answer.aid))
                    setCurrPage(Constants.USER_PROFILE)
                }}>
                    Delete
                </button>
            }
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

export function AnswerNav(props) {
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
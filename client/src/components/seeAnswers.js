import React, { useContext, useEffect, Fragment, useState } from 'react';
import { QuestionsInfo } from './HomePage';
import { AskQuestion } from './body';
import { DateMetadata, splitArray } from './questionspage';
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

        return () => { isMounted = false; }
    })

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
                    <div id='asked-by'><DateMetadata question={currDisplayedQuestion} /></div>
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
    const emptyFieldStr = "This field must be filled out.";
    const [comments, setComments] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const handleSubmit = async (event) => {
        event.preventDefault();
        const commentText = event.target.commenttext.value.trim();
        const commentUser = event.target.commentuser.value.trim();
        const errors = validateForm({commentText, commentUser});
        if(Object.keys(errors).length === 0) {
            try {
                event.target.reset();
                setFormErrors({});
                setComments(!comments);
                await axios.post('http://localhost:8000/postQComment', {
                    text: commentText,
                    com_by: commentUser,
                    com_date_time: new Date(),
                    votes: 0,
                    qid: answer.aid
                })
            } catch { console.log(errors); }
        } else setFormErrors(errors);
    }

    const validateForm = ({commentText, commentUser}) => {
        const errors = {};
        if(commentText.length === 0) errors.commentText = emptyFieldStr;
        const tokens = commentText.match(/\[[^\]]*\]\([^)]*\)/g); // [...](...). "..." = anything (including empty string)
        const regex = /\[.+?\]\(\s*(https:\/\/|http:\/\/)[^)](.*?)\)/g; // [text](link)
        if(tokens) {
            for(let token of tokens) if(!regex.test(token))
                errors.ansText = "Hyperlink in answer text invalid. Must be of the form [text](link).";
        }
        if(commentUser.length === 0) errors.commentUser = emptyFieldStr;
        return errors;
    }

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
            <DateMetadata answer={answer}/>
            {/* <div className="answer-comment-container">
                <div className="answer-comments">
                    {console.log(answer.comments)}
                    {answer.comments.map((c) => <div>{c.text}</div>)}
                </div>
                {comments
                    ? <form id='post-comment' onSubmit={handleSubmit}>
                        <input type='text' name='commenttext' />
                        {formErrors.commentText && <ErrorMessage errMsg={formErrors.commentText} />}
                        <input type='text' name='commentuser' />
                        {formErrors.commentUser && <ErrorMessage errMsg={formErrors.commentUser} />}
                        <input type='submit' value="Post Comment" />
                    </form>
                    : <div id="add-comment-container"><button id="add-comment" type="button" onClick={() => {setComments(!comments)}}>Add Comment</button></div>
                }
            </div> */}
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
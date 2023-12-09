import React, { useContext, useEffect, useState } from 'react';
import * as Constants from '../constants';
import {QuestionsInfo} from './HomePage';
import Comments from './Comments';
import axios from 'axios';

let questionChunkInd = 0;

// Contains all of the content specifically associated with the questions page.

export default function QuestionsPage() {
    return (
        <>
            <div id="questions-header-container">
                <div id="questions-header">
                    <h1 id="type-results-header">{useContext(QuestionsInfo).typeResults}</h1>
                    <AskQuestion />
                </div>
                <div id="question-filter">
                    <p id="num-questions">{useContext(QuestionsInfo).numQuestions} questions</p>
                    <Filters />
                </div>
            </div>
            <Questions />
            {useContext(QuestionsInfo).numQuestions > 5 && <QuestionNav />}
        </>
    )
}

// SUBCOMPONENTS

function AskQuestion() {
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrPage = questionsInfo.setCurrPage;
    return <div id="ask-question-container"><button id="ask-question" type="button" onClick={() => setCurrPage(Constants.POST_QUESTION_PAGE)}>Ask Question</button></div>
}

function Filters() {
    //NOTE: USE CURR FILTER TO CHANGE COLOR OF FILTER
    return (
        <table id="filters" border="3">
            <tbody>
                <tr id="col-names">
                    <Filter filterName={"Newest"} filter={Constants.NEWEST_FILTER} />
                    <Filter filterName={"Active"} filter={Constants.ACTIVE_FILTER} />
                    <Filter filterName={"Unanswered"} filter={Constants.UNANSWERED_FILTER} />
                </tr>
            </tbody>
        </table>
    )
}

function Filter(props) {
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrFilter = questionsInfo.setCurrFilter;
    const setTypeResults = questionsInfo.setTypeResults;
    return (
        <td id={props.filterName} onClick={() => {
            questionChunkInd = 0;
            setCurrFilter(props.filter);
            setTypeResults("All Questions");
        }}>{props.filterName}</td>
    )
}

function Questions() {
    const currDisplayedQuestions = useContext(QuestionsInfo).currDisplayedQuestions;
    const currFilter = useContext(QuestionsInfo).currFilter;

    return (
        <div id="questions">
            {(currDisplayedQuestions.length === 0 && currFilter === Constants.SEARCH_FILTER)
                ? <h1 id="no-questions-found">No Questions Found</h1>
                : currDisplayedQuestions.map((q) => (<Question key={q.qid} question={q} />))
            }
        </div>
    )
}

function Question({question}) {
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrPage = questionsInfo.setCurrPage;
    const setDisplayedQuestion = questionsInfo.setDisplayedQuestion;
    const [tags, setTags] = useState([])
    const [views, setViews] = useState(question.views)
    const [votes, setVotes] = useState(question.votes)
    const [username, setUsername] = useState('')

    let qid = question.qid;
    let currTitleTagsContainer = qid + "-title-tags-container";
    let currTagsContainer = qid + "-tags-container";

    useEffect(() => {
        const getTags = async () => {
            await axios.get('http://localhost:8000/tags', {params: question.tagIds})
            .then(res => { setTags(res.data) })
        }
        getTags();
    }, [question])

    useEffect(() => {
        const getViews = async() => {
            await axios.get(`http://localhost:8000/views`, {params: question})
            .then(res => { setViews(res.data) })
        }
        getViews();
    }, [question])

    useEffect(() => {
        const getQuestionUsername = async () => {
            await axios.get('http://localhost:8000/userData', {params: question })
            .then(res => { setUsername(res.data) })
        }
        getQuestionUsername();
    }, [question])

    return (
        <div className="question">
            <div className="question-container">
                <div className="votes">
                    <p className="upvote" onClick={() => {
                        const incQVote = async() => {
                                const q = question;
                                setVotes(q.votes++);
                            setDisplayedQuestion(q);
                            try { await axios.post('http://localhost:8000/incQVote', q) }
                            catch(error) { console.log(error) }
                        }
                        incQVote();
                    }}>🡅</p>
                    {votes}
                    <p className="downvote" onClick={() => {
                        const decQVote = async() => {
                            const q = question;
                            setVotes(q.votes--);
                            setDisplayedQuestion(q);
                            try { await axios.post('http://localhost:8000/decQVote', q) }
                            catch(error) { console.log(error) }
                        }
                        decQVote();
                    }}>🡇</p>
                </div>
                <p className='interaction-stats'>
                    {question.ansIds.length} answers
                    <br />
                    {views} views
                </p>

                <div id={currTitleTagsContainer} className='title-tags-container'>
                    <div className="title" onClick={() => {
                        const incrementView = async() => {
                            const q = question;
                            q.views++;
                            setDisplayedQuestion(q);
                            try { await axios.post('http://localhost:8000/incrementView', q) }
                            catch(error) { console.log(error) }
                        }
                        incrementView();
                        setCurrPage(Constants.SEE_ANSWERS_PAGE);
                    }}>
                        {question.title} 
                    </div>
                    <div className="question-summary">{question.summary}</div>
                    <div id={currTagsContainer} className='tags-container'>{tags.map((t) => <div key={t.tid} className='tags'>{t.name}</div>)}</div>
                </div>
                <DateMetadata question={question} user={username} />
            </div>
            <Comments question={question} />
        </div>
    )
}

export function DateMetadata(props) {
    let q = props.question;
    let a = props.answer;
    let c = props.comment;
    let u = props.user;
    let time_now = new Date();
    let time_posted, posted_by, str;
    if(q) { // Question
        time_posted = new Date(q.askDate);
        posted_by = u;
        str = " asked ";
    }
    if(a) { // Answer
        time_posted = new Date(a.ansDate);
        posted_by = u;
        str = " answered "
    }
    if(c) { // Comment
        time_posted = new Date(c.comDate);
        posted_by = u;
        str = " commented "
    }
    const time_ago = time_now - time_posted;
    const num_secs = Math.round((time_now - time_posted)/(1000));
    const minutes_ago = 1000 * 60;
    const num_mins = Math.round((time_now - time_posted)/(1000 * 60));
    const hours_ago = minutes_ago * 60;
    const num_hours = Math.round((time_now - time_posted)/(1000 * 60 * 60));
    const days_ago = hours_ago * 24;
    const years_ago = days_ago * 365;
    let post_time = "";
    
    if(time_ago > years_ago) post_time = posted_by + str + " on " + time_posted.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false});
    else if(time_ago > days_ago) post_time = posted_by + str + " on " + time_posted.toLocaleString('en-US', { month: 'long' }) + " " + time_posted.getDate() +
        " at " + time_posted.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false});
    else if(time_ago > hours_ago) post_time = posted_by + str + num_hours + " hour" + ((num_hours === 1) ? "" : "s") + " ago";
    else if(time_ago > minutes_ago) post_time = posted_by + str + num_mins + " minute" + ((num_mins === 1) ? "" : "s") + " ago";
    else post_time = posted_by + str + ((num_secs === 0) ? "just now" : num_secs + " second" + ((num_secs === 1) ? "" : "s") + " ago");
    return ( <div className='time'>{post_time}</div> )
}

function QuestionNav() {
    const questionsInfo = useContext(QuestionsInfo);
    const allQuestions = questionsInfo.allQuestions;
    const setDisplayedQuestions = questionsInfo.setDisplayedQuestions;
    const questionChunks = splitArray(allQuestions, 5);
    
    return (
        <div id="nav-button-container">
            {questionChunkInd !== 0 && <Button id={"prev-button"} setDisplayedQuestions={setDisplayedQuestions} questionChunks={questionChunks} /> }
            {questionChunkInd === 0 && <div />}
            {questionChunkInd !== (questionChunks.length - 1) && <Button id={"next-button"} setDisplayedQuestions={setDisplayedQuestions} questionChunks={questionChunks} />}
        </div>
    )
}

function Button(props) {
    const setDisplayedQuestions = props.setDisplayedQuestions;
    const questionChunks = props.questionChunks;
    return (
        <div id={props.id} onClick={() => {
            if(props.id === "prev-button" && questionChunkInd > 0) questionChunkInd--;
            if(props.id === "next-button" && questionChunkInd < questionChunks.length - 1) questionChunkInd++;
            setDisplayedQuestions(questionChunks[questionChunkInd]);
        }}>
            {props.id === "prev-button" && "◄ Prev"}
            {props.id === "next-button" && "Next ►"}
        </div>
    )
}

// Helper function to split array into chunks of five
export function splitArray(arr, num) {
    let splittedArray = [];
    for(let i = 0; i < arr.length; i += num) splittedArray.push(arr.slice(i, i + num));
    return splittedArray;
}
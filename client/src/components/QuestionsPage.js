import React, { useContext, useEffect, useState } from 'react';
import * as Constants from '../constants'
import {QuestionsInfo} from './HomePage'
import axios from 'axios'

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
    return (
        <div id="ask-question-container">
            <button id="ask-question" type="button" onClick={() => setCurrPage(Constants.POST_QUESTION_PAGE)}>Ask Question</button>
        </div>
    )
}

function Filters() {
    //NOTE: USE CURR FILTER TO CHANGE COLOR OF FILTER

    const questionsInfo = useContext(QuestionsInfo);
    
    const setCurrFilter = questionsInfo.setCurrFilter;
    const setTypeResults = questionsInfo.setTypeResults;

    return (
        <table id="filters" border="3">
            <tbody>
                <tr id="col-names">
                    <td id="Newest" onClick={() => {
                        questionChunkInd = 0;
                        setCurrFilter(Constants.NEWEST_FILTER);
                        setTypeResults("All Questions");
                    }}>Newest</td>

                    <td id="Active" onClick={() => {
                        questionChunkInd = 0;
                        setCurrFilter(Constants.ACTIVE_FILTER);
                        setTypeResults("All Questions");
                    }}>Active</td>

                    <td id="Unanswered" onClick={() => {
                        questionChunkInd = 0;
                        setCurrFilter(Constants.UNANSWERED_FILTER);
                        setTypeResults("All Questions");
                    }}>Unanswered</td>
                </tr>
            </tbody>
        </table>
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

    let qid = question.qid;
    let currTitleTagsContainer = qid + "-title-tags-container";
    let currTagsContainer = qid + "-tags-container";

    useEffect(() => {
            const getTags = async () => {
                await axios.get('http://localhost:8000/tags', { params: question.tagIds })
                .then(res => {setTags(res.data)})
            }
            getTags();
        }, [question])

    return (
        <div className="question-container">
            <p className='interaction-stats'>
                {question.ansIds.length} answers
                <br />
                {question.views} views
            </p>

            <div id={currTitleTagsContainer} className='title-tags-container'>
                <div className="title" onClick={() => {
                    const incrementView = async() => {
                        try { await axios.post('http://localhost:8000/incrementView', question) }
                        catch(error) { console.log(error) }
                    }
                    incrementView();
                    setDisplayedQuestion(question);
                    setCurrPage(Constants.SEE_ANSWERS_PAGE);
                }}>
                    {question.title} 
                </div>

                <div id={currTagsContainer} className='tags-container'>
                    {tags.map((t) => <div key={t.tid} className='tags'>{t.name}</div>)}
                </div>
            </div>
            
            <QuestionDateMetadata question={question} />
        </div>
    )
}

export function QuestionDateMetadata(props) {
    let q = props.question;

    let time_now = new Date();
    let time_asked = new Date(q.askDate);

    // Years ago
    if(time_now - time_asked > 1000 * 60 * 60 * 24 * 365) {
        return (
            <p className='time-since-asked'>
                {q.askedBy + " asked " + time_asked.toLocaleString('en-US', { month: 'long', day: 'numeric', 
                    year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false})}
            </p>
        )
    }

    // Days ago
    else if(time_now - time_asked > 1000 * 60 * 60 * 24) {
        return (
            <p className='time-since-asked'>
                {q.askedBy + " asked " + time_asked.toLocaleString('en-US', { month: 'long' }) + " " + time_asked.getDate() + 
                    " at " + time_asked.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}
            </p>
        )
    }

    // Hours ago
    else if(time_now - time_asked > 1000 * 60 * 60)
        return ( <p className='time-since-asked'>{q.askedBy + " asked " + Math.round((time_now - time_asked)/(1000 * 60 * 60)) + " hours ago"}</p> )

    // Minutes ago
    else if(time_now - time_asked > 1000 * 60)
        return ( <p className='time-since-asked'>{q.askedBy + " asked " + Math.round((time_now - time_asked)/(1000 * 60)) + " minutes ago"}</p> )

    // Seconds ago
    else return ( <p className='time-since-asked'>{q.askedBy + " asked " + Math.round((time_now - time_asked)/(1000)) + " seconds ago"}</p> )
}

function QuestionNav() {
    const questionsInfo = useContext(QuestionsInfo);
    const allQuestions = questionsInfo.allQuestions;
    const setDisplayedQuestions = questionsInfo.setDisplayedQuestions;
    const questionChunks = splitArray(allQuestions);
    
    return (
        <div id="nav-button-container">
            <div id="prev-button" onClick={() => {
                if(questionChunkInd > 0) {
                    questionChunkInd--;
                    setDisplayedQuestions(questionChunks[questionChunkInd]);
                }
            }}>◄ Prev</div>
            <div id="next-button" onClick={() => {
                if(questionChunkInd < questionChunks.length - 1) {
                    questionChunkInd++;
                    setDisplayedQuestions(questionChunks[questionChunkInd]);
                }
            }}>Next ►</div>
        </div>
    )
}

// Helper function to split array into chunks of five
export function splitArray(arr) {
    let splittedArray = [];
    for(let i = 0; i < arr.length; i += 5) splittedArray.push(arr.slice(i, i + 5));
    return splittedArray;
}
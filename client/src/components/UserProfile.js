import { useEffect, useState } from 'react';
import axios from 'axios'
import * as Constants from '../constants'
import TagCard from './TagCard';

export function UserProfile({setCurrPage, setDisplayedPost}) {
    const [userInfo, setUserInfo] = useState(0);

    useEffect(() => {

        const getUserInfo = async () => {
            const userInfo = await axios.get('http://localhost:8000/userProfile')
            setUserInfo(userInfo.data)
        }
        getUserInfo()
    }, [])

    return (
        <div id='user-profile'>
            <h2 className="profile-header">Profile Info</h2>
            <div id="profile-card">
                <h3 id='username'>
                    {userInfo.username}
                </h3>
                <p>
                    Reputation: {userInfo.reputation}
                    <br/>
                    {MemberSinceTime(userInfo.timeJoined)}
                </p>
            </div>
            <PostedQuestions setCurrPage={setCurrPage} setDisplayedPost={setDisplayedPost}/>
            <AnsweredQuestions setCurrPage={setCurrPage} setDisplayedPost={setDisplayedPost}/>
            <UsedTags setCurrPage={setCurrPage} />
        </div>
    )
}

export function PostedQuestions({setCurrPage, setDisplayedPost}) {
    const [postedQuestions, setPostedQuestions] = useState([])

    useEffect(() => {
        const getPostedQuestions = async () => {
            const postedQuestions = await axios.get('http://localhost:8000/postedQuestions')
            setPostedQuestions(postedQuestions.data)
        }

        getPostedQuestions()
    }, [])

    return (
        <div>
            <h3 className='profile-header'>Posted Questions</h3>
            <div>
                {postedQuestions.length ? postedQuestions.map((q) => <PostedQuestion key={q.qid} question={q} 
                setCurrPage={setCurrPage} setDisplayedPost={setDisplayedPost}/>) : 'No Questions'}
            </div>
        </div>
    )
}

function PostedQuestion({question, setCurrPage, setDisplayedPost}) {
    return (
        <div className='user-profile-question-title' onClick={() =>{
            setCurrPage(Constants.MODIFY_QUESTION_PAGE)
            setDisplayedPost(question)
        }}>
            {question.title}
        </div>
    )
}

function AnsweredQuestions({setCurrPage, setDisplayedPost}) {
    const [answeredQuestions, setAnsweredQuestions] = useState([])

    useEffect(() => {
        const getAnsweredQuestions = async () => {
            const answeredQuestions = await axios.get('http://localhost:8000/answeredQuestions')
            setAnsweredQuestions(answeredQuestions.data)
        }

        getAnsweredQuestions()
    }, [])

    return (
        <>
            <h3 className='profile-header'>
                Answered Questions
            </h3>
            {answeredQuestions.length ? answeredQuestions.map(q => <AnsweredQuestion key={q.qid} question={q} 
                setCurrPage={setCurrPage} setDisplayedPost={setDisplayedPost}/>) : 'No Questions'}
        </>
    )
}

function AnsweredQuestion({question, setCurrPage, setDisplayedPost}) {
    return (
        <div className='user-profile-question-title' onClick={() =>{
            setCurrPage(Constants.SEE_USER_ANSWERS_PAGE)
            setDisplayedPost(question)
        }}>
            {question.title}
        </div>
    )
}

function UsedTags() {
    const [usedTags, setUsedTags] = useState([])

    useEffect(() => {
        const getUsedTags = async () => {
            const res = await axios.get('http://localhost:8000/usedTags')
            setUsedTags(res.data)
        }

        getUsedTags()
    }, [])

    return (
        <>
            <h3 className='profile-header'>Created Tags</h3>
            {usedTags.length ? (
                <div id='tags-page-content'>
                    {usedTags.map(t => <TagCard key={t.tid} tag={t} isUsers={true} setUsedTags={setUsedTags} usedTags={usedTags}/>)}
                </div>
            ) : (
                <div>No Tags</div>
            )}
        </>
    )
}

function MemberSinceTime(timeJoined) {

    let formattedTime = "Member for "
    let time_asked = new Date(timeJoined)
    let time_now = new Date();
    const time_ago = time_now - time_asked;
    const minutes_ago = 1000 * 60;
    const hours_ago = minutes_ago * 60;
    const days_ago = hours_ago * 24;
    const years_ago = days_ago * 365;
    
    if(time_ago > years_ago) return formattedTime + Math.round(time_ago/years_ago) + " year" + ((Math.round(time_ago/years_ago) > 1) ? "s" : "");
    if(time_ago > days_ago) return formattedTime + Math.round(time_ago/days_ago) + " day" + ((Math.round(time_ago/days_ago) > 1) ? "s" : "");
    if(time_ago > hours_ago) return formattedTime + Math.round(time_ago/hours_ago) + " hour" + ((Math.round(time_ago/hours_ago) > 1) ? "s" : "");
    if(time_ago > minutes_ago) return formattedTime + Math.round(time_ago/minutes_ago) + " minute" + ((Math.round(time_ago/minutes_ago) > 1) ? "s" : "");
    else return formattedTime + Math.round(time_ago/(1000)) + " second" +  + ((Math.round(time_ago/1000) > 1) ? "s" : "");
}
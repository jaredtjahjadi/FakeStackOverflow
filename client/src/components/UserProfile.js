import { useEffect, useState } from 'react';
import axios from 'axios'
import * as Constants from '../constants'

export function UserProfile({setCurrPage, setDisplayedQuestion}) {

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
            <PostedQuestions setCurrPage={setCurrPage} setDisplayedQuestion={setDisplayedQuestion}/>
        </div>
    )
}

export function PostedQuestions({setCurrPage, setDisplayedQuestion}) {
    const [postedQuestions, setPostedQuestions] = useState([])

    useEffect(() => {
        const getPostedQuestions = async () => {
            const postedQuestions = await axios.get('http://localhost:8000/postedQuestions')
            setPostedQuestions(postedQuestions.data)
        }

        getPostedQuestions()
    }, [])

    return (
        <>
            <h3 className='profile-header'>
                Posted Questions
            </h3>
            {postedQuestions.length ? postedQuestions.map(q => <PostedQuestion key={q.qid} question={q} 
                setCurrPage={setCurrPage} setDisplayedQuestion={setDisplayedQuestion}/>) : 'No Questions'}
        </>
    )
}

function PostedQuestion({question, setCurrPage, setDisplayedQuestion}) {

    return (
        <div className='title' onClick={() =>{
            setCurrPage(Constants.MODIFY_QUESTION_PAGE)
            setDisplayedQuestion(question)
        }}>
            {question.title}
        </div>
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
    
    if(time_ago > years_ago) return formattedTime + Math.round(time_ago/years_ago) + " years";
    if(time_ago > days_ago) return formattedTime + Math.round(time_ago/days_ago) + " days";
    if(time_ago > hours_ago) return formattedTime + Math.round(time_ago/hours_ago) + " hours";
    if(time_ago > minutes_ago) return formattedTime + Math.round(time_ago/minutes_ago) + " minutes";
    else return formattedTime + Math.round(time_ago/(1000)) + " seconds";
}
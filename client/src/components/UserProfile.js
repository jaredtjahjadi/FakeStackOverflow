import { useContext, useEffect, useState } from 'react';
import { QuestionsInfo } from './HomePage';
import axios from 'axios'
import * as Constants from '../constants'
import TagCard from './TagCard';

export function UserProfile({setCurrPage, setDisplayedPost}) {
    const questionsInfo = useContext(QuestionsInfo);
    const currUserProfile = questionsInfo.currUserProfile;
    const setUserProfile = questionsInfo.setUserProfile;
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const getUserInfo = async () => {
            const userInfo = await axios.get('http://localhost:8000/userProfile', { params: currUserProfile })
            setUserInfo(userInfo.data)
        }
        getUserInfo()
    }, [currUserProfile])

    return (
        <div id='user-profile'>
            <h2 className="profile-header">Profile Info</h2>
            <div id="profile-card">
                <h3 id='username'>{userInfo.username}</h3>
                <p>
                    Reputation: {userInfo.reputation}
                    <br/>
                    {MemberSinceTime(userInfo.timeJoined)}
                </p>
            </div>
            <PostedQuestions currUserProfile={currUserProfile} setCurrPage={setCurrPage} setDisplayedPost={setDisplayedPost}/>
            <AnsweredQuestions currUserProfile={currUserProfile} setCurrPage={setCurrPage} setDisplayedPost={setDisplayedPost}/>
            <UsedTags currUserProfile={currUserProfile} setCurrPage={setCurrPage} />
            {userInfo.role === 'ADMIN' && <UserList setUserProfile={setUserProfile} />}
        </div>
    )
}

export function PostedQuestions({currUserProfile, setCurrPage, setDisplayedPost}) {
    const [postedQuestions, setPostedQuestions] = useState([])

    useEffect(() => {
        const getPostedQuestions = async () => {
            const postedQuestions = await axios.get('http://localhost:8000/postedQuestions', { params: currUserProfile })
            setPostedQuestions(postedQuestions.data)
        }

        getPostedQuestions()
    }, [currUserProfile])

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

function AnsweredQuestions({currUserProfile, setCurrPage, setDisplayedPost}) {
    const [answeredQuestions, setAnsweredQuestions] = useState([])

    useEffect(() => {
        const getAnsweredQuestions = async () => {
            const answeredQuestions = await axios.get('http://localhost:8000/answeredQuestions', {params: currUserProfile})
            setAnsweredQuestions(answeredQuestions.data)
        }
        getAnsweredQuestions()
    }, [currUserProfile])

    return (
        <>
            <h3 className='profile-header'>Answered Questions</h3>
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

function UsedTags({currUserProfile}) {
    const [usedTags, setUsedTags] = useState([])

    useEffect(() => {
        const getUsedTags = async () => {
            const res = await axios.get('http://localhost:8000/usedTags', {params: currUserProfile})
            setUsedTags(res.data)
        }

        getUsedTags()
    }, [currUserProfile])

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

function UserList({setUserProfile}) {
    const [userList, setUserList] = useState([]);
    useEffect(() => {
        const getAllUsers = async () => {
            await axios.get('http://localhost:8000/allUsers')
            .then(res => { setUserList(res.data) })
        }
        getAllUsers();
    }, [])

    return (
        <div>
            <h3 className='profile-header'>User List</h3>
            {userList.length ?
                <div>
                    {userList.map(user => <div key={user.uid} className='user-list-item'>
                        <div className='user-list-item-name' onClick={() => setUserProfile(user)}>{user.username}</div>
                        <Delete user={user} />
                    </div>)}
                </div> :
            <div>No Users</div>}
        </div>
    )
}

function Delete({user}) {
    const [deleteWarning, setDeleteWarning] = useState(false);
    return (
        <div>
            {deleteWarning ?
            <div className='delete-confirm'>
                Are you sure you want to delete this user? {''}
                <span className='delete-yes' onClick={() => {
                    const deleteUser = async () => { await axios.post('http://localhost:8000/deleteUser', user) }
                    deleteUser().then(() => { alert("User has been deleted.") })
                    .catch(error => {
                        alert(error.response.data.message);
                        setDeleteWarning(!deleteWarning);
                    });
                }}>Y</span> / {''}
                <span className='delete-no' onClick={() => setDeleteWarning(!deleteWarning)}>N</span>
            </div> :
            <div className='delete-user' onClick={() => setDeleteWarning(!deleteWarning)}>Delete</div>}
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
    
    if(time_ago > years_ago) return formattedTime + Math.round(time_ago/years_ago) + " year" + ((Math.round(time_ago/years_ago) > 1) ? "s" : "");
    if(time_ago > days_ago) return formattedTime + Math.round(time_ago/days_ago) + " day" + ((Math.round(time_ago/days_ago) > 1) ? "s" : "");
    if(time_ago > hours_ago) return formattedTime + Math.round(time_ago/hours_ago) + " hour" + ((Math.round(time_ago/hours_ago) > 1) ? "s" : "");
    if(time_ago > minutes_ago) return formattedTime + Math.round(time_ago/minutes_ago) + " minute" + ((Math.round(time_ago/minutes_ago) > 1) ? "s" : "");
    else return formattedTime + Math.round(time_ago/(1000)) + " second" + ((Math.round(time_ago/1000) > 1) ? "s" : "s");
}
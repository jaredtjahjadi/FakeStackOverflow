import { useEffect, useState } from 'react';
import axios from 'axios'

export function UserProfile() {

    const [userInfo, setUserInfo] = useState(0);

    useEffect(() => {

        const getUserInfo = async () => {
            const userInfo = await axios.get('http://localhost:8000/userProfile')
            setUserInfo(userInfo.data)
            console.log(userInfo.username)
        }

        getUserInfo()
    }, [])

    return (
        <div id='user-profile'>
            <h2 id="profile-info-header">Profile Info</h2>
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
        </div>
    )
}

export function PostedQuestions() {

}

function MemberSinceTime(timeJoined) {

    let time_asked = new Date(timeJoined)
    let time_now = new Date();
    const time_ago = time_now - time_asked;
    const minutes_ago = 1000 * 60;
    const hours_ago = minutes_ago * 60;
    const days_ago = hours_ago * 24;
    const years_ago = days_ago * 365;
    
    if(time_ago > years_ago) return 'Member since ' + time_asked.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false});
    else if(time_ago > days_ago) return 'Member since ' + time_asked.toLocaleString('en-US', { month: 'long' }) + " " + time_asked.getDate() +
        " at " + time_asked.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false});
    else if(time_ago > hours_ago) return 'Member since ' + Math.round((time_now - time_asked)/(1000 * 60 * 60)) + " hours ago";
    else if(time_ago > minutes_ago) return 'Member since ' + Math.round((time_now - time_asked)/(1000 * 60)) + " minutes ago";
    else return 'Member since ' + Math.round((time_now - time_asked)/(1000)) + " seconds ago";
}
import React, { useEffect, useState } from 'react';
import { AskQuestion } from './Body';
import TagCard from './TagCard';
import axios from 'axios';

export default function TagsPage() {
    const [tags, setTags] = useState([]);
    useEffect(() => {
        const getTags = async () => {
            await axios.get('http://localhost:8000/alltags')
            .then(res => { setTags(res.data) })
        }
        getTags();
    })
    const tagCards = [];
    for(let tag of tags) tagCards.push(<TagCard key={tag.tid} tag={tag} />);
    const numTags = tags.length;
    return (
        <div id="tags-page">
            <div id="tags-page-header">
                <div className="num-tags"><h1>{numTags} Tags</h1></div>
                <div className="all-tags"><h1>All Tags</h1></div>
                <AskQuestion />
            </div>
            <div id="tags-page-content">{tagCards}</div>
        </div>
    )
}
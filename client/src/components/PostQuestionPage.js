import { useContext, useState } from 'react';
import FormField from './FormField';
import * as Constants from '../constants';
// import { model } from './fakestackoverflow';
import { QuestionsInfo } from './HomePage';
import axios from 'axios'

export default function PostQuestionPage() {
    const emptyFieldStr = "This field must be filled out."
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrPage = questionsInfo.setCurrPage;
    const setCurrFilter = questionsInfo.setCurrFilter;
    const [formErrors, setFormErrors] = useState({});

    const handleSubmit = async (event) => {
        event.preventDefault(); // Stop the page from refreshing
        const questionTitle = event.target.title.value.trim();
        const questionTagStr = event.target.tags.value.trim();
        const inputTags = questionTagStr.split(" ");
        const questionTags = inputTags.filter(inputTag => inputTag !== "").map(inputTag => inputTag.toLowerCase());
        const questionText = event.target.qtext.value.trim();
        const questionUsername = event.target.quser.value.trim();
        const errors = validateForm({questionTitle, questionText, questionTagStr, questionTags, questionUsername});
        // If no errors in form (all fields are valid)
        if(Object.keys(errors).length === 0) {
            try {
                const questionData = {
                    title: questionTitle,
                    text: questionText,
                    tags: questionTags,
                    answers: [],
                    asked_by: questionUsername,
                    ask_date_time: new Date(),
                    views: 0,
                    votes: 0
                }
                /**
                 * TODO (Jared)
                 * Fix issue: Upon submit, the questions page loads with newest filter, but the question that was
                 * just submitted does not appear. In the below section, putting setCurrPage and setCurrFilter under
                 * the Axios post request does not seem to work.
                 */
                setCurrPage(Constants.QUESTIONS_PAGE);
                setCurrFilter(Constants.NEWEST_FILTER);
                event.target.reset();
                setFormErrors({});
                await axios.post('http://localhost:8000/addQuestion', questionData);
            } catch (error) { console.log(error); }
        } else setFormErrors(errors);
    }

    // Form validation: Add corresponding property to errors object if an error is found
    const validateForm = ({ questionTitle, questionText, questionTagStr, questionTags, questionUsername }) => {
        const errors = {};

        // Title validation
        if (questionTitle.length === 0) errors.questionTitle = emptyFieldStr;
        else if (questionTitle.length > 100) errors.questionTitle = "Question title must be no more than 100 characters.";
    
        // Text validation
        if (questionText.length === 0) errors.questionText = emptyFieldStr;
        // Hyperlink validation
        const tokens = questionText.match(/\[[^\]]*\]\([^)]*\)/g); // [...](...). "..." = anything (including empty string)
        const regex = /\[.+?\]\((https:\/\/|http:\/\/)[^)](.*?)\)/g; // [text](link)
        // If potential hyperlinks are present in the question text
        if(tokens) {
            for(let token of tokens) if(!regex.test(token))
                errors.questionText = "Hyperlink in question text invalid. Must be of the form [text](link).";
        }
        if(questionTagStr.length === 0) errors.questionTags = emptyFieldStr;
        if(questionTags.length > 5) errors.questionTags = "No more than five tags for one question."; // Ensure there are no more than 5 tags
        // Ensure each tag is no more than 10 characters
        for(var i = 0; i < questionTags.length; i++) {
            let lower = questionTags[i].toLowerCase();
            if((lower !== "shared-preferences" || lower !== "web-scripting" || lower !== "android-studio") && lower.length > 10)
                if(lower.length > 10) errors.questionTags = "Tag length must be no more than 10 characters.";
        }
        if(questionUsername.length === 0) errors.questionUsername = emptyFieldStr;
        return errors;
    };

    /**
     * TODO (Jared): Double-check if only one error is allowed to appear at a time or if multiple errors can appear. If the latter, fix below code.
     */
    return (
        <div id="new-question">
            <form id="new-question-form" name="new-question" onSubmit={handleSubmit}>
                <FormField
                    id="question-title"
                    title="Question Title"
                    instrs="Limit title to 100 characters or less"
                    input={true}
                    name='title'
                />
                {formErrors.questionTitle && <ErrorMessage errMsg={formErrors.questionTitle} />}
                <FormField
                    id="question-text"
                    title="Question Text"
                    instrs="Add details"
                    input={false}
                    name='qtext'
                />
                {formErrors.questionText && <ErrorMessage errMsg={formErrors.questionText} />}
                <FormField
                    id="question-tags"
                    title="Tags"
                    instrs="Add keywords separated by whitespace"
                    input={true}
                    name='tags'
                />
                {formErrors.questionTags && <ErrorMessage errMsg={formErrors.questionTags} />}
                <FormField
                    id="question-username"
                    title="Username"
                    input={true}
                    name='quser'
                />                
                {formErrors.questionUsername && <ErrorMessage errMsg={formErrors.questionUsername} />}
                <div id="end-form">
                    <input className="submit-button" type="submit" value="Post Question" />
                    <div id="mandatory-fields">* indicates mandatory fields</div>
                </div>
            </form>
        </div>
    )
}

export function ErrorMessage(props) { return ( <div className='error-message'>{props.errMsg}</div> ) }
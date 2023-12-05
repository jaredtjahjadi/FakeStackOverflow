export default function FormField(props) {
    
    return (
        <div id={props.id}>
            <h1>{props.title}*</h1>
            {props.instrs ?
                <div className="instructions">{props.instrs}</div> :
                null
            }
            {props.input ? 
                <input className='input-text' type='text' name={props.name} 
                    value={props.value ? props.value : ''} onChange={props.onChange ? props.onChange : null}/> :
                <textarea className='input-text' type='text' name={props.name} 
                    value={props.value ? props.value : ''} onChange={props.onChange ? props.onChange : null}/>
            }
        </div>
    )
}
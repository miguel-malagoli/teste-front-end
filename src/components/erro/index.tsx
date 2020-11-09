import React from 'react';
import { textChangeRangeIsUnchanged } from 'typescript';

const Erro = (props: {text: any}) => {
    return (
        <div className="erro">
            <p className="erro__emote">{props.text.code + ' :('}</p>
            <p className="erro__texto" dangerouslySetInnerHTML={{__html: props.text.message}}></p>
        </div>
    );
};

export default Erro;
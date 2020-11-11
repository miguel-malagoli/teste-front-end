import React from 'react';

const Erro = (props: {errorInfo: any, noResults: boolean}) => {
    return (
        <div className="erro">
            <p className="erro__emote">
                {props.noResults ?
                'Nada :('
                :
                (props.errorInfo.code + ' :(')}
            </p>
            {props.errorInfo ?
            <p className="erro__texto" dangerouslySetInnerHTML={{__html: props.errorInfo.message}}></p>
            :
            <p className="erro__texto">
                Não encontramos nenhum resultado. Tente novamente com outros termos de pesquisa.
            </p>}
            
        </div>
    );
};

export default Erro;
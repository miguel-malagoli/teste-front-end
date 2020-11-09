import React, { RefObject } from 'react';

const Carregamento = (props: {hasMoreResults: boolean, elementRef: RefObject<HTMLDivElement>}) => {
    return (
        <footer className="carregamento" ref={props.elementRef}>
            {props.hasMoreResults ?
            <div className="carregamento__animacao">
                <div className="carregamento__ponto" style={{animationDelay: '0s'}}></div>
                <div className="carregamento__ponto" style={{animationDelay: '.1s'}}></div>
                <div className="carregamento__ponto" style={{animationDelay: '.2s'}}></div>
            </div>
            :
            <p className="carregamento__fim">Fim dos resultados</p>}
        </footer>
    );
}

export default Carregamento;
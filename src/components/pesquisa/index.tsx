import React, { ChangeEvent, FormEvent, useState } from 'react';

// Componente de pesquisa
const Pesquisa = (props: {handleSearch: (terms: string) => void, hasResults: boolean}) => {

    // Hooks de estado
    const [left, setLeft] = useState(false);
    const [focus, setFocus] = useState(false);
    const [terms, setTerms] = useState('');

    // Receber input do usuário
    function changeTerms(event: ChangeEvent<HTMLInputElement>) {
        setTerms(event.target.value.replace(/[^a-zA-Z0-9 ]/g, ''));
    }

    // Realizar pesquisa com os termos atuais
    function search(event: FormEvent) {
        props.handleSearch(terms);
        event.preventDefault();
    }

    // Renderizar
    return (
        <header className={'pesquisa' + (props.hasResults ? ' pesquisa_top' : '') + (left ? ' pesquisa_left' : '')}>
            <div className="pesquisa__metade">
                <form className={'pesquisa__barra' + (focus ? ' pesquisa__barra_foco' : '')}
                    onFocus={() => {setFocus(true)}}
                    onBlur={() => {setFocus(false)}}
                    onSubmit={search}>
                    <div className="pesquisa__fundo">
                        <input
                            className="pesquisa__input"
                            type="text"
                            name="terms"
                            placeholder="Pesquisar..."
                            value={terms}
                            onChange={changeTerms}
                            required
                            autoFocus
                        />
                    </div>
                    <button className="pesquisa__buscar" type="submit">
                        <svg className="pesquisa__icone" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img">
                            <title>Buscar</title>
                            <path d="M23.822 20.88l-6.353-6.354c.93-1.465 1.467-3.2
                                1.467-5.059.001-5.219-4.247-9.467-9.468-9.467s-9.468 4.248-9.468 9.468c0
                                5.221 4.247 9.469 9.468 9.469 1.768 0 3.421-.487 4.839-1.333l6.396 6.396
                                3.119-3.12zm-20.294-11.412c0-3.273 2.665-5.938 5.939-5.938 3.275 0 5.94
                                2.664 5.94 5.938 0 3.275-2.665 5.939-5.94 5.939-3.274 0-5.939-2.664-5.939-5.939z"
                            />
                        </svg>
                    </button>
                </form>
            </div>
            <div className="pesquisa__metade">
                <button className="pesquisa__voltar" type="button">

                </button>
                <div className="pesquisa__titulo">
                </div>
            </div>
        </header>
    );
};

export default Pesquisa;
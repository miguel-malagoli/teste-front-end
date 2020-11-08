import React, { ChangeEvent, FormEvent, useState } from 'react';

// Componente de pesquisa
const Pesquisa = () => {

    // Hooks de estado
    const [left, setLeft] = useState(false);
    const [focus, setFocus] = useState(false);
    const [terms, setTerms] = useState('');
    const [results, setResults] = useState<Array<never> | null>(null);
    const [pageToken, setPageToken] = useState('');
    const [statistics, setStatistics] = useState([]);

    // Receber input do usuário
    function changeTerms(event: ChangeEvent<HTMLInputElement>) {
        setTerms(event.target.value.replace(/[^a-zA-Z0-9]/g, ''));
    }

    // Realizar pesquisa com os termos atuais
    function search(event: FormEvent) {
        // Request para os snippets
        const xmlResults = new XMLHttpRequest();
        xmlResults.onreadystatechange = () => {
            if (xmlResults.readyState === 4 && xmlResults.status === 200) {
                const response = JSON.parse(xmlResults.responseText);
                console.log(response);

                setPageToken(response.nextPageToken);
                setResults(response.items);
                const ids: string = response.items.map((i: any) => i.id.videoId).join();

                // Segunda request usando as IDs dos videos para conseguir seus detalhes
                const xmlDetails = new XMLHttpRequest();
                xmlDetails.onreadystatechange = () => {
                    if (xmlDetails.readyState === 4 && xmlDetails.status === 200) {
                        console.log(JSON.parse(xmlDetails.responseText));
                        setStatistics(
                            JSON.parse(xmlDetails.responseText).items.map(
                                (i: any) => i.statistics
                            )
                        );
                    }
                }

                xmlDetails.open(
                    'GET',
                    'https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' +
                    ids + 
                    '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
                );
                xmlDetails.send();
            }
        };

        xmlResults.open(
            'GET',
            'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=12&q=' +
            terms.replace(/[^a-zA-Z0-9]/g, '') +
            '&pageToken=' + pageToken +
            '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
        );
        xmlResults.send();
        event.preventDefault();
    }

    // Renderizar
    return (
        <header className={'pesquisa' + (results ? ' pesquisa_top' : '') + (left ? ' pesquisa_left' : '')}>
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
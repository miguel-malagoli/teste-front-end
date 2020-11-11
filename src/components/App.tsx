import React, { useEffect, useState } from 'react';
import Pesquisa from './Pesquisa';
import Lista, {ChannelRef, StatsRef} from './Lista';
import Carregamento from './Carregamento';
import Erro from './Erro';

const App = () => {

    // Hooks de estado
    const [terms, setTerms] = useState('');
    const [fixedTerms, setFixedTerms] = useState('');
	const [results, setResults] = useState<Array<never> | null>(null);
	const [statistics, setStatistics] = useState<StatsRef>({});
    const [channels, setChannels] = useState<ChannelRef>({});
    const [pageToken, setPageToken] = useState('');
    const [activeResult, setActiveResult] = useState<string | null>(null);
    const [activeTitle, setActiveTitle] = useState<string | null>(null);
    const [listTransition, setListTransition] = useState(false);
    const [searchError, setSearchError] = useState<any>(null);
    const [searchEnd, setSearchEnd] = useState(false);
    // Hooks de efeito
    useEffect(() => {
        if (pageToken !== '') window.onscroll = () => {
            if (activeResult === null &&
                searchError === null &&
                searchEnd === false &&
                (window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                continueSearch(pageToken);
                window.onscroll = null;
            }
        }
    }, [fixedTerms, pageToken, statistics, channels, activeResult, searchEnd, searchError]);

	// Realizar pesquisa com os termos atuais
    function search() {
        setFixedTerms(terms);
        // Request para os snippets
        const xmlResults = new XMLHttpRequest();
        xmlResults.onreadystatechange = () => {
            if (xmlResults.readyState === 4 && xmlResults.status === 200) {
                const response = JSON.parse(xmlResults.responseText);
                // Resetar e abortar se não houver resultados
                if (response.items.length <= 0) {
                    setResults(null);
                    setPageToken('');
                    setStatistics({});
                    setChannels({});
                    setSearchError(null);
                    setSearchEnd(true);
                    return;
                }
                // Do contrário, preparar as próximas duas requests
                setResults(response.items);
                setSearchEnd(false);
                setSearchError(null);
                window.scrollTo({top: 0, left: 0, behavior: "smooth"});
				const videoIDs: string = response.items.map((i: any) => i.id.videoId).join();
				const channelIDs: string = response.items.map((i: any) => i.snippet.channelId).join();
				// Segunda request usando as IDs dos canais para conseguir suas imagens
				const xmlChannels = new XMLHttpRequest();
				xmlChannels.onreadystatechange = () => {
                    if (xmlChannels.readyState === 4 && xmlChannels.status === 200) {
                        const newChannels = JSON.parse(xmlChannels.responseText).items.reduce(
                            (ref: any, i: any) => {
                                ref[i.id] = i.snippet.thumbnails.default.url;
                                return ref;
                            }, {}
                        );
                        setChannels(newChannels);
                    }
                }
                xmlChannels.open(
                    'GET',
                    'https://www.googleapis.com/youtube/v3/channels?part=snippet&id=' +
                    channelIDs + 
                    '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
                );
                xmlChannels.send();
                // Terceira request usando as IDs dos videos para conseguir seus detalhes
                const xmlDetails = new XMLHttpRequest();
                xmlDetails.onreadystatechange = () => {
                    if (xmlDetails.readyState === 4 && xmlDetails.status === 200) {
                        const newStats = JSON.parse(xmlDetails.responseText).items.reduce(
                            (ref: any, i: any) => {
                                ref[i.id] = {
                                    dislikeCount: i.statistics.dislikeCount,
                                    likeCount: i.statistics.likeCount,
                                    viewCount: i.statistics.viewCount,
                                    description: i.snippet.description
                                };
                                return ref;
                            }, {}
                        );
                        setStatistics(newStats);
                    }
                }
                xmlDetails.open(
                    'GET',
                    'https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=' +
                    videoIDs + 
                    '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
                );
                xmlDetails.send();
                // Atualizar a token para o scroll infinito
                if (response.nextPageToken) {
                    setPageToken(response.nextPageToken);
                } else {
                    setPageToken('');
                    setSearchEnd(true);
                }
            } else if (xmlResults.readyState === 4 && xmlResults.status >= 400) {
                setSearchError(JSON.parse(xmlResults.responseText).error);
            }
        };
        xmlResults.open(
            'GET',
            'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=12&q=' +
            terms.replace(/[^a-zA-Z0-9 ]/g, '') +
            '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
        );
        xmlResults.send();
    }

    // Estender a pesquisa à próxima página
    function continueSearch(page: string) {
        // Request para os snippets
        const xmlResults = new XMLHttpRequest();
        xmlResults.onreadystatechange = () => {
            if (xmlResults.readyState === 4 && xmlResults.status === 200) {
                const response = JSON.parse(xmlResults.responseText);
                // Resetar e abortar se não houver resultados
                if (response.items.length <= 0) {
                    setSearchEnd(true);
                    setPageToken('');
                    return;
                }
                // Do contrário, preparar as próximas duas requests
                const newItems = response.items.filter((i: any) => {
                    return !(Object.keys(statistics).includes(i.id.videoId));
                });
                if (results) setResults(results.concat(newItems));
				const videoIDs: string = newItems.map((i: any) => i.id.videoId).join();
				const channelIDs: string = newItems.map((i: any) => i.snippet.channelId).join();
				// Segunda request usando as IDs dos canais para conseguir suas imagens
				const xmlChannels = new XMLHttpRequest();
				xmlChannels.onreadystatechange = () => {
                    if (xmlChannels.readyState === 4 && xmlChannels.status === 200) {
                        const newChannels = JSON.parse(xmlChannels.responseText).items.reduce(
                            (ref: any, i: any) => {
                                ref[i.id] = i.snippet.thumbnails.default.url;
                                return ref;
                            }, {}
                        );
                        const newChannelRef = {...channels};
                        for (let [key, value] of Object.entries(newChannels)) {
                            newChannelRef[key] = value as string;
                        }
                        setChannels(newChannelRef);
                    }
                }
                xmlChannels.open(
                    'GET',
                    'https://www.googleapis.com/youtube/v3/channels?part=snippet&id=' +
                    channelIDs + 
                    '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
                );
                xmlChannels.send();
                // Terceira request usando as IDs dos videos para conseguir seus detalhes
                const xmlDetails = new XMLHttpRequest();
                xmlDetails.onreadystatechange = () => {
                    if (xmlDetails.readyState === 4 && xmlDetails.status === 200) {
                        const newStats = JSON.parse(xmlDetails.responseText).items.reduce(
                            (ref: any, i: any) => {
                                ref[i.id] = {
                                    dislikeCount: i.statistics.dislikeCount,
                                    likeCount: i.statistics.likeCount,
                                    viewCount: i.statistics.viewCount,
                                    description: i.snippet.description
                                };
                                return ref;
                            }, {}
                        );
                        const newStatsRef = {...statistics};
                        for (let [key, value] of Object.entries(newStats)) {
                            newStatsRef[key] = {
                                dislikeCount: (value as any).dislikeCount,
                                likeCount: (value as any).likeCount,
                                viewCount: (value as any).viewCount,
                                description: (value as any).description
                            }
                        }
                        setStatistics(newStatsRef);
                    }
                }
                xmlDetails.open(
                    'GET',
                    'https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=' +
                    videoIDs + 
                    '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
                );
                xmlDetails.send();
                // Atualizar a token para o scroll infinito
                if (response.nextPageToken) {
                    setPageToken(response.nextPageToken);
                } else {
                    setPageToken('');
                    setSearchEnd(true);
                }

            } else if (xmlResults.readyState === 4 && xmlResults.status >= 400) {
                setSearchError(JSON.parse(xmlResults.responseText).error);
            }
        };
        xmlResults.open(
            'GET',
            'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=12&q=' +
            fixedTerms.replace(/[^a-zA-Z0-9 ]/g, '') +
            '&pageToken=' + page +
            '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
        );
        xmlResults.send();
    }

    // Lidar com a seleção de um resultado da lista como o resultado "ativo"
    function handleSelect(id: string | null) {
        setListTransition(true);
        const prevId = activeResult;
        if (prevId && id === null) {
            setTimeout(() => {
                    setActiveResult(id);
                    document.getElementsByClassName(prevId)[0].scrollIntoView({behavior: "auto", block: "center"});
                    setListTransition(false);
                },
                200
            );
        } else if (id) {
            window.scrollTo({top: 0, left: 0, behavior: "auto"});
            setListTransition(false);
            setActiveResult(id);
        }
    }

    // Renderizar
	return (
		<div className="app">
			<Pesquisa
                terms={terms}
                handleTerms={setTerms}
                up={(results !== null || searchError !== null || searchEnd)}
                handleSearch={search}
                activeTitle={activeTitle}
                handleClear={() => {
                    handleSelect(null);
                    setActiveTitle(null);
                }}
            />
            {(searchError || (results === null && searchEnd)) ?
            <Erro errorInfo={searchError} noResults={searchEnd} />
            :
            <Lista
                results={results}
                statistics={statistics}
                channels={channels}
                handleTitle={setActiveTitle}
                activeResult={activeResult}
                handleActiveResult={handleSelect}
                transition={listTransition}
            />}
            {results && activeResult === null && <Carregamento hasMoreResults={!searchEnd} />}
		</div>
	);
}

export default App;
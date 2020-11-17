import React, { useEffect, useState } from 'react';
import Pesquisa from './Pesquisa';
import Lista, {ChannelRef, StatsRef} from './Lista';
import Carregamento from './Carregamento';
import Erro from './Erro';

const App = () => {

    // Utilizar Axios
    const axios = require('axios');
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

    function search() {
        setFixedTerms(terms);
        // Request para os snippets
        axios.get(
            'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=12&q=' +
            terms.replace(/[^a-zA-Z0-9 ]/g, '') +
            '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
        ).then((resp: any) => {
            if (resp.request.readyState === 4 && resp.request.status === 200) {
                const items = resp.data.items;
                // Resetar e abortar se não houver resultados
                if (items.length <= 0) {
                    setResults(null);
                    setPageToken('');
                    setStatistics({});
                    setChannels({});
                    setSearchError(null);
                    setSearchEnd(true);
                    return;
                }
                // Do contrário, preparar as próximas duas requests
                setResults(items);
                setSearchEnd(false);
                setSearchError(null);
                window.scrollTo({top: 0, left: 0, behavior: "smooth"});
				const videoIDs: string = items.map((i: any) => i.id.videoId).join();
                const channelIDs: string = items.map((i: any) => i.snippet.channelId).join();
                // Atualizar a token para o scroll infinito
                if (resp.data.nextPageToken) {
                    setPageToken(resp.data.nextPageToken);
                } else {
                    setPageToken('');
                    setSearchEnd(true);
                }
                // Segunda request usando as IDs dos canais para conseguir suas imagens
                axios.get(
                    'https://www.googleapis.com/youtube/v3/channels?part=snippet&id=' +
                    channelIDs + 
                    '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
                ).then((channelResp: any) => {
                    if (channelResp.request.readyState === 4 && channelResp.request.status === 200) {
                        const newChannels = channelResp.data.items.reduce(
                            (ref: any, i: any) => {
                                ref[i.id] = i.snippet.thumbnails.default.url;
                                return ref;
                            }, {}
                        );
                        setChannels(newChannels);
                    }
                });
                // Terceira request usando as IDs dos videos para conseguir seus detalhes
                axios.get(
                    'https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=' +
                    videoIDs + 
                    '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
                ).then((statResp: any) => {
                    if (statResp.request.readyState === 4 && statResp.request.status === 200) {
                        const newStats = statResp.data.items.reduce(
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
                });
            } else if (resp.request.readyState === 4 && resp.request.status >= 400) {
                setSearchError(resp.data.error);
            }
        });
    }

    // Estender a pesquisa à próxima página
    function continueSearch(page: string) {
        // Request para os snippets
        axios.get(
            'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=12&q=' +
            fixedTerms.replace(/[^a-zA-Z0-9 ]/g, '') +
            '&pageToken=' + page +
            '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
        ).then((resp: any) => {
            if (resp.request.readyState === 4 && resp.request.status === 200) {
                // Resetar e abortar se não houver resultados
                if (resp.data.items.length <= 0) {
                    setSearchEnd(true);
                    setPageToken('');
                    return;
                }
                // Do contrário, preparar as próximas duas requests
                const newItems = resp.data.items.filter((i: any) => {
                    return !(Object.keys(statistics).includes(i.id.videoId));
                });
                if (results) setResults(results.concat(newItems));
				const videoIDs: string = newItems.map((i: any) => i.id.videoId).join();
                const channelIDs: string = newItems.map((i: any) => i.snippet.channelId).join();
                // Atualizar a token para o scroll infinito
                if (resp.data.nextPageToken) {
                    setPageToken(resp.data.nextPageToken);
                } else {
                    setPageToken('');
                    setSearchEnd(true);
                }
                // Segunda request usando as IDs dos canais para conseguir suas imagens
                axios.get(
                    'https://www.googleapis.com/youtube/v3/channels?part=snippet&id=' +
                    channelIDs + 
                    '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
                ).then((channelResp: any) => {
                    if (channelResp.request.readyState === 4 && channelResp.request.status === 200) {
                        const newChannels = channelResp.data.items.reduce(
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
                });
                // Terceira request usando as IDs dos videos para conseguir seus detalhes
                axios.get(
                    'https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=' +
                    videoIDs + 
                    '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
                ).then((statResp: any) => {
                    if (statResp.request.readyState === 4 && statResp.request.status === 200) {
                        const newStats = statResp.data.items.reduce(
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
                });
            } else if (resp.request.readyState === 4 && resp.request.status >= 400) {
                setPageToken('');
                setSearchEnd(true);
            }
        });
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
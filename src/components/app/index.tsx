import React, { useEffect, useRef, useState } from 'react';
import Pesquisa from '../pesquisa';
import Lista, {ChannelRef, StatsRef} from '../lista';
import Carregamento from '../carregamento';

const App = () => {

    // Hooks de estado
    const [terms, setTerms] = useState('');
	const [results, setResults] = useState<Array<never> | null>(null);
	const [statistics, setStatistics] = useState<StatsRef>({});
    const [channels, setChannels] = useState<ChannelRef>({});
    const [pages, setPages] = useState<Array<string>>([]);
    const [pageToken, setPageToken] = useState('');
    const [activeResult, setActiveResult] = useState<string | null>(null);
    const [activeTitle, setActiveTitle] = useState<string | null>(null);
    const [listTransition, setListTransition] = useState(false);
    // Hooks de referência
    const loading = useRef<HTMLDivElement>(null);
    // Hooks de efeito
    useEffect(() => {
        const observer = new IntersectionObserver(
            () => {search(pageToken)},
            {
                root: null,
                rootMargin: '200px 0px 0px 0px',
                threshold: 0
            }
        );
        if (loading.current) observer.observe(loading.current);
    }, [results]);

	// Realizar pesquisa com os termos atuais
    function search(page?: string) {
        if (page && pages.includes(page)) return;
        setPages(page ? pages.concat([page]) : ['']);
        // Request para os snippets
        const xmlResults = new XMLHttpRequest();
        xmlResults.onreadystatechange = () => {
            if (xmlResults.readyState === 4 && xmlResults.status === 200) {
                const response = JSON.parse(xmlResults.responseText);
                console.log(response);

                setPageToken(response.nextPageToken);
                if (page && results) {
                    setResults(results?.concat(response.items));
                } else {
                    setResults(response.items);
                    window.scrollTo({top: 0, left: 0, behavior: "smooth"});
                }
				const videoIDs: string = response.items.map((i: any) => i.id.videoId).join();
				const channelIDs: string = response.items.map((i: any) => i.snippet.channelId).join();

				// Segunda request usando as IDs dos canais para conseguir suas imagens
				const xmlChannels = new XMLHttpRequest();
				xmlChannels.onreadystatechange = () => {
                    if (xmlChannels.readyState === 4 && xmlChannels.status === 200) {
                        console.log(JSON.parse(xmlChannels.responseText));
                        const newChannels = JSON.parse(xmlChannels.responseText).items.reduce(
                            (ref: any, i: any) => {
                                ref[i.id] = i.snippet.thumbnails.default.url;
                                return ref;
                            }, {}
                        );
                        if (page) {
                            const newChannelRef = channels;
                            for (let [key, value] of Object.entries(newChannels)) {
                                newChannelRef[key] = value as string;
                            }
                            setChannels(newChannelRef);
                        } else {
                            setChannels(newChannels);
                        }
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
                        console.log(JSON.parse(xmlDetails.responseText));
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
                        if (page) {
                            const newStatsRef = statistics;
                            for (let [key, value] of Object.entries(newStats)) {
                                newStatsRef[key] = {
                                    dislikeCount: (value as any).dislikeCount,
                                    likeCount: (value as any).likeCount,
                                    viewCount: (value as any).viewCount,
                                    description: (value as any).description
                                }
                            }
                            setStatistics(newStatsRef);
                        } else {
                            setStatistics(newStats);
                        }
                    }
                }
                xmlDetails.open(
                    'GET',
                    'https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=' +
                    videoIDs + 
                    '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
                );
                xmlDetails.send();
            }
        };

        xmlResults.open(
            'GET',
            'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=12&q=' +
            terms.replace(/[^a-zA-Z0-9 ]/g, '') +
            (page ? ('&pageToken=' + page) : '') +
            '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
        );
        xmlResults.send();
    }

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

	return (
		<div className="app">
			<Pesquisa
                terms={terms}
                handleTerms={setTerms}
                hasResults={(results !== null)}
                handleSearch={search}
                activeTitle={activeTitle}
                handleClear={() => {
                    handleSelect(null);
                    setActiveTitle(null);
                }}
            />
			<Lista
                results={results}
                statistics={statistics}
                channels={channels}
                handleTitle={setActiveTitle}
                activeResult={activeResult}
                handleActiveResult={handleSelect}
                transition={listTransition}
            />
            {results && <Carregamento hasMoreResults={true} elementRef={loading} />}
		</div>
	);
}

export default App;
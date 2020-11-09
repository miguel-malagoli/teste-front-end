import React, { useState } from 'react';
import Pesquisa from '../pesquisa';
import Lista, {ChannelRef, StatsRef} from '../lista';

const App = () => {

	// Hooks de estado
	const [results, setResults] = useState<Array<never> | null>(null);
	const [statistics, setStatistics] = useState<StatsRef>({});
	const [channels, setChannels] = useState<ChannelRef>({});
    const [pageToken, setPageToken] = useState('');
    const [activeResult, setActiveResult] = useState<string | null>(null);
    const [activeTitle, setActiveTitle] = useState<string | null>(null);
    const [listTransition, setListTransition] = useState(false);

	// Realizar pesquisa com os termos atuais
    function search(terms: string) {
        // Request para os snippets
        const xmlResults = new XMLHttpRequest();
        xmlResults.onreadystatechange = () => {
            if (xmlResults.readyState === 4 && xmlResults.status === 200) {
                const response = JSON.parse(xmlResults.responseText);
                console.log(response);

                setPageToken(response.nextPageToken);
                setResults(response.items);
				const videoIDs: string = response.items.map((i: any) => i.id.videoId).join();
				const channelIDs: string = response.items.map((i: any) => i.snippet.channelId).join();

				// Segunda request usando as IDs dos canais para conseguir suas imagens
				const xmlChannels = new XMLHttpRequest();
				xmlChannels.onreadystatechange = () => {
                    if (xmlChannels.readyState === 4 && xmlChannels.status === 200) {
						console.log(JSON.parse(xmlChannels.responseText));
						setChannels(
							JSON.parse(xmlChannels.responseText).items.reduce(
								(ref: any, i: any) => {
									ref[i.id] = i.snippet.thumbnails.default.url;
									return ref;
								}, {}
							)
						);
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
						setStatistics(
							JSON.parse(xmlDetails.responseText).items.reduce(
								(ref: any, i: any) => {
									ref[i.id] = {
										dislikeCount: i.statistics.dislikeCount,
										likeCount: i.statistics.likeCount,
										viewCount: i.statistics.viewCount,
										description: i.snippet.description
									};
									return ref;
								}, {}
							)
						);
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
            '&pageToken=' + pageToken +
            '&key=AIzaSyBbS29keWaqCw9J7NLNfhxFbvc0c5ceGIc'
        );
        xmlResults.send();
    }

    function handleSelect(id: string | null) {
        setListTransition(true);
        const prevId = activeResult
        
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
		</div>
	);
}

export default App;
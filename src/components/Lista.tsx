import React from 'react';
import Resultado from './Resultado';

// Interfaces para receber referências de imagem de canal e feedback de vídeo
export interface ChannelRef {
	[index: string]: string
}
export interface StatsRef {
	[index: string]: {
		dislikeCount: number;
		likeCount: number;
        viewCount: number;
        description: string;
	}
}

const Lista = (props: {
    results: Array<never> | null,
    statistics: StatsRef,
    channels: ChannelRef,
    handleTitle: (title: string | null) => void,
    activeResult: string | null,
    handleActiveResult: (id: string | null) => void,
    transition: boolean
    }) => {

    return (
        <ul className={'lista' + (props.transition ? ' lista_transicao' : '')}>
            {props.results?.map((r: any) => {
            return (
                <Resultado
                    key={r.id.videoId}
                    video={r}
                    profileImg={props.channels[r.snippet.channelId]}
                    stats={props.statistics[r.id.videoId]}
                    active={(props.activeResult === r.id.videoId)}
                    hidden={(props.activeResult !== null)}
                    handleSelect={props.handleActiveResult}
                    handleTitle={props.handleTitle}
                />
            )
            })}
        </ul>
    );
}

export default Lista;
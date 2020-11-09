import React, { useState } from 'react';
import Resultado from '../resultado';

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
    handleActiveResult: (id: string | null) => void
    }) => {

    

    // function handleSelect(id: string | null) {
    //     const prevId = props.activeResult
    //     props.handleActiveResult(id);
    //     if (prevId && id === null) {
    //         setTimeout(
    //             () => document.getElementsByClassName(prevId)[0].scrollIntoView({behavior: "auto", block: "center"}),
    //             100
    //         );
    //     } else if (id) {
    //         window.scrollTo({top: 0, left: 0, behavior: "auto"});
    //     }
    // }

    return (
        <ul className="lista">
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
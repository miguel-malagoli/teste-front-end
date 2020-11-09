import React from 'react';
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
    channels: ChannelRef
    }) => {

    return (
        <ul className="lista">
            {props.results?.map((r: any) => {
            return (
                <Resultado
                    key={r.id.videoId}
                    video={r}
                    profileImg={props.channels[r.snippet.channelId]}
                    stats={props.statistics[r.id.videoId]}
                    active={false}
                />
            )
            })}
        </ul>
    );
}

export default Lista;
import React from 'react';

const Resultado = (props: {
        video: any,
        profileImg: string,
        stats: any,
        active: boolean,
        hidden: boolean,
        handleSelect: (id: string | null) => void,
        handleTitle: (title: string |null) => void
    }) => {

    const likeRatio = props.stats ?
        Math.round(
            Number.parseInt(props.stats.likeCount) / 
            (Number.parseInt(props.stats.likeCount) + Number.parseInt(props.stats.dislikeCount)) * 100
        )
    : 0;
    
    return (
        <li
            key={props.video.id.videoId}
            className={
                'resultado' +
                (props.active ? ' resultado_ativo' : '') +
                (props.hidden ? ' resultado_escondido' : '')
            }
            tabIndex={(props.active ? -1 : 0)}
            onClick={(props.active ? () => {} : () => {
                props.handleTitle(props.video.snippet.title);
                props.handleSelect(props.video.id.videoId);
            })}
        >
            <div className="resultado__conteudo">
                <div className="resultado__tela">
                    <img
                        className="resultado__thumbnail"
                        src={props.video.snippet.thumbnails.high.url}
                        alt={'Thumbnail do vídeo "' + props.video.snippet.title + '"'}
                    />
                    <iframe
                        className="resultado__video"
                        title={props.video.id.videoId}
                        src={'https://www.youtube.com/embed/' + props.video.id.videoId}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        tabIndex={(props.active ? 0 : -1)}>
                    </iframe>
                </div>
                <div className="resultado__disposicao">
                    <div className="resultado__info">
                        <img
                            className="resultado__imagem" 
                            src={props.profileImg}
                            alt={'Imagem de perfil de ' + props.video.snippet.channelTitle}
                        />
                        <div className="resultado__dados">
                            <div className={'resultado__titulo ' + props.video.id.videoId}>
                                {props.video.snippet.title}
                            </div>
                            <div className="resultado__canal">
                                {props.video.snippet.channelTitle}
                            </div>
                            <div className="resultado__visualizacoes">
                                {props.stats?.viewCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' Visualizações'}
                            </div>
                        </div>
                    </div>
                    <div className={'interacao' + (props.active ? ' interacao_ativa' : '')}>
                        <div className="interacao__contagem">
                            <div className="interacao__metade">
                                <svg className="interacao__like" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img">
                                    <title>Like</title>
                                    <path d="M5 22h-5v-12h5v12zm17.615-8.412c-.857-.115-.578-.734.031-.922.521-.16
                                        1.354-.5 1.354-1.51
                                        0-.672-.5-1.562-2.271-1.49-1.228.05-3.666-.198-4.979-.885.906-3.656.688-8.781-1.688-8.781-1.594
                                        0-1.896 1.807-2.375 3.469-1.221 4.242-3.312 6.017-5.687 6.885v10.878c4.382.701 6.345 2.768
                                        10.505 2.768 3.198 0 4.852-1.735 4.852-2.666
                                        0-.335-.272-.573-.96-.626-.811-.062-.734-.812.031-.953 1.268-.234 1.826-.914 1.826-1.543
                                        0-.529-.396-1.022-1.098-1.181-.837-.189-.664-.757.031-.812 1.133-.09 1.688-.764 1.688-1.41
                                        0-.565-.424-1.109-1.26-1.221z"
                                    />
                                </svg>
                                <p className="interacao__numero">
                                    {props.stats?.likeCount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                </p>
                            </div>
                            <div className="interacao__metade">
                                <p className="interacao__numero">
                                    {props.stats?.dislikeCount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                </p>
                                <svg className="interacao__dislike" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img">
                                    <title>Dislike</title>
                                    <path d="M5 14h-5v-12h5v12zm18.875-4.809c0-.646-.555-1.32-1.688-1.41-.695-.055-.868-.623-.031-.812.701-.159
                                    1.098-.652 1.098-1.181 0-.629-.559-1.309-1.826-1.543-.766-.141-.842-.891-.031-.953.688-.053.96-.291.96-.626-.001-.931-1.654-2.666-4.852-2.666-4.16
                                    0-6.123 2.067-10.505 2.768v10.878c2.375.869 4.466 2.644 5.688 6.886.478 1.661.781 3.468
                                    2.374 3.468 2.375 0 2.594-5.125 1.688-8.781 1.312-.688 3.751-.936 4.979-.885 1.771.072
                                    2.271-.818 2.271-1.49 0-1.011-.833-1.35-1.354-1.51-.609-.188-.889-.807-.031-.922.836-.112
                                    1.26-.656 1.26-1.221z"
                                />
                                </svg>
                            </div>
                        </div>
                        <div className="interacao__barra">
                            <div className="interacao__barraLike"
                                style={{flex: (Number.isNaN(likeRatio) ? 0 : likeRatio)}}>
                            </div>
                            <div className="interacao__barraMeio"></div>
                            <div className="interacao__barraDislike"
                                style={{flex: (Number.isNaN(likeRatio) ? 0 : (100 - likeRatio))}}>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="resultado__descricao">
                    {props.active ? props.stats?.description : props.video.snippet.description}
                </div>
            </div>
            <button className="resultado__detalhes"
                type="button"
                tabIndex={(props.active ? 0 : -1)}
                onClick={(props.active ? () => {
                    props.handleTitle(null);
                    props.handleSelect(null);
                } : () => {})}>
                {(props.active ? '-  Voltar' : '+  Detalhes')}
            </button>
        </li>
    );
}

export default Resultado;
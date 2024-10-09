import React from "react";

export const YouTube: React.FC<{videoId: string}> = ({videoId}) => {

    return (
        <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/UlcAx6uXRsk?si=${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen>
        </iframe>

    )

}

/*
<iframe width="560" height="315" src="https://www.youtube.com/embed/UlcAx6uXRsk?si=2S40z7EzhieSkrH3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
 */
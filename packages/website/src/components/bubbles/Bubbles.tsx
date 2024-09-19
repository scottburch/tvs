import React, {PropsWithChildren, ReactNode} from "react";
import './bubbles.css'

export const Bubbles: React.FC<PropsWithChildren> = ({children}) => {
    return (
        <div className={'imessage'}>
            {children}
        </div>
    )
}

export const BubbleMessage: React.FC<PropsWithChildren<{from: 'me' | 'them'}>> = ({children, from}) => (
    <p className={`from-${from}`}>{children}</p>
)

export const BubbleConvo: React.FC<{convo: (ReactNode | ReactNode[])[]}> = ({convo}) => {
    let count = 0;
    return (
        <Bubbles>
            {convo.map((it, idx) => Array.isArray(it) ? (
                it.map(it => <BubbleMessage key={count++} from={idx % 2 ? 'me' : 'them'}>{it}</BubbleMessage>)
            ) :
                (<BubbleMessage key={count++} from={idx % 2 ? 'me' : 'them'}>{it}</BubbleMessage>)
            )}
        </Bubbles>
    )
}


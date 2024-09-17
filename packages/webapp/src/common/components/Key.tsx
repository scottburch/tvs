import React, {PropsWithChildren} from "react";

export const Key: React.FC<PropsWithChildren> = ({children}) => (
    <pre>{children}</pre>
)
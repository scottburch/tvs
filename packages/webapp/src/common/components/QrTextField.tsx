import React, {ChangeEvent, useEffect, useState} from "react";
import {Box, Button, Modal, Stack, TextField} from "@mui/material";
import {QrCode2} from '@mui/icons-material'
import {Scanner} from "@yudiel/react-qr-scanner";

export const QrTextField: typeof TextField = ({value, onChange , ...props}) => {
    const [qrOpen, setQrOpen] = useState(false);
    const [text, setText] = useState(value || '')

    const scanFinished = (text: string) => {
        setQrOpen(false);
        setText(text)
        onChange && onChange({target: {value: text}} as ChangeEvent<HTMLInputElement>)
    }

    const textFieldOnChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setText(ev.target.value);
        onChange && onChange(ev)
    }

    useEffect(() => {
        value && setText(value);
    }, [value])

    props = {...props, slotProps: {...props.slotProps, input: {...props.slotProps?.input, endAdornment: <Button onClick={() => setQrOpen(true)} variant={'outlined'}><QrCode2/></Button>}}}
    return (<>
            <TextField {...props} value={text} onChange={textFieldOnChange}/>
            <Modal open={qrOpen}>
                <Box sx={modalStyle}>
                    <Stack spacing={2}>
                        <Box height={200} width={200}>
                            <Scanner onScan={(result) => scanFinished(result[0].rawValue)}/>
                        </Box>
                    <Button variant={'outlined'} onClick={() => setQrOpen(false)}>Close</Button>
                    </Stack>
                </Box>
            </Modal>
        </>
    );
};

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

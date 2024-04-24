import { Radio, RadioGroup, Stack } from "@chakra-ui/react";

export default function CommonRadio({ radioOptions, value, setValue }) {
    return (
        <RadioGroup onChange={setValue} value={value}>
            <Stack direction='row'>
                {radioOptions.map((option, index) =>
                    <Radio key={index} value={option.value ? option.value : option}>
                        {option.label ? option.label : option}
                    </Radio>
                )}
            </Stack>
        </RadioGroup>
    )
}
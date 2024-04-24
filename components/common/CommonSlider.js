import {
    Box,
    Slider,
    SliderFilledTrack,
    SliderMark,
    SliderThumb,
    SliderTrack,
    Text
} from "@chakra-ui/react";

export default function CommonSlider({
    name, defaultValue = 1, min = 1, max = 5, step = 0.5,
    onChange, sliderValue, onMouseLeave, onMouseEnter,
    labelMin = '', labelMax = '', onChangeEnd }) {

    const labelStyles = {
        mt: '2',
        ml: '-2.5',
        fontSize: 'sm',
    }

    return (
        <>
            <Slider
                key={0} mb='4%'
                name={name}
                defaultValue={defaultValue}
                min={min} max={max} step={step}
                onChange={onChange}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onChangeEnd={onChangeEnd}
            >
                {
                    Array.from(
                        { length: (max - min) + 1 },
                        (value, index) => min + index
                    ).map((value, index) => (
                        <SliderMark
                            key={index} value={value}
                            {...labelStyles}
                        >
                            <Text>{value}</Text>
                            {value === min && labelMin && <Text fontSize={"2xs"}>({labelMin})</Text>}
                            {value === max && labelMax && <Text fontSize={"2xs"}>({labelMax})</Text>}
                        </SliderMark>
                    ))
                }

                <SliderTrack bg='red.100'>
                    <Box position='relative' right={10} />
                    <SliderFilledTrack bg='tomato' />
                </SliderTrack>

                <SliderThumb boxSize={6}>
                    {(sliderValue % 1 != 0) &&
                        // Show slider value in thumb only if the value is in decimal
                        <Text fontSize={'xs'} color={'red.500'}>
                            {sliderValue}
                        </Text>
                    }
                </SliderThumb>
            </Slider>
        </>
    )
}
import {
    Badge,
    Box
} from '@chakra-ui/react'

export default function DayBadge({ meetingDays }) {
    const meetingDaysArray = meetingDays.split('  ').map(d => d.toLowerCase())

    const weekDays = {
        'U': 'sun', 'M': 'mon', 'T': 'tue',
        'W': 'wed', 'R': 'thr', 'F': 'fri', 'S': 'sat'
    }

    const meetingDaysOfWeek = Object.values(weekDays).map(day =>
        meetingDaysArray.includes(day)
    )

    return (
        <Box>
            <Badge
                size='lg' mb={0.5}
                variant='subtle'
                colorScheme="blackAlpha"
            >
                {Object.keys(weekDays).map((code, index) => (
                    meetingDaysOfWeek[index] ?
                        <Box key={index} as="span" sx={{ color: 'red.400' }}>
                            {`${code} `}
                        </Box>
                        :
                        `${code} `
                ))}
            </Badge>
        </Box>
    )
}
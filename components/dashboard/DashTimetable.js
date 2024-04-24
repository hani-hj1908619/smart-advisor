import { Heading, Card, CardHeader, CardBody } from '@chakra-ui/react'
import Timetable from '../common/Timetable'

export default function DashTimetable({ schedule, height }) {

    return (
        <Card size='md' mb={5} height={height} sx={{bgColor: 'gray.50'}}>
            <CardHeader pb={2}>
                <Heading size='md'>Spring 2022 Schedule</Heading>
            </CardHeader>

            <CardBody pt={2}>
                <Timetable height={height} schedule={ schedule }/>
            </CardBody>
        </Card>
    )
}
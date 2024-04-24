import {
    Center,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';


export default function Timetable({ height, schedule, overflow }) {

    let hours = ['8', '', '9', '', '10', '', '11', '', '12', '', '13', '', '14', '', '15', '', '16', '', '17', '', '18', '', '19']
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat']
    const [arr, setArr] = useState([])

    useEffect(() => {
        setArr([])
        for (let i = 0; i < schedule.length; i++) {
            if (!schedule[i].section) continue
            const scheduleCourse = schedule[i]
            const section = { ...scheduleCourse.section }
            if (section.meetingTimes.length < 2) {
                section.meetingTimes[0].meetingDays.split('  ').forEach((day) => {
                    const newSection = { ...section, meetingDays: day }
                    const newScheduleCourse = { ...scheduleCourse, section: newSection }
                    setArr(prevArr => [...prevArr, { ...newScheduleCourse }]);
                });
            } else {
                section.meetingTimes.forEach((meetingTime) => {
                    meetingTime.meetingDays.split('  ').forEach((day) => {
                        const newSection = { ...section, meetingDays: day }
                        const newScheduleCourse = { ...scheduleCourse, section: newSection }
                        setArr(prevArr => [...prevArr, { ...newScheduleCourse }])
                    });
                });
            }
        }

        setArr(prevArr => {
            const sortedArr = [...prevArr];
            sortedArr.sort((a, b) => {
                const timeA = parseInt(a.section.meetingTimes[0].meetingTimeStart.split(':')[0]);
                const timeB = parseInt(b.section.meetingTimes[0].meetingTimeStart.split(':')[0]);
                if (timeA < timeB) {
                    return -1;
                } else if (timeA > timeB) {
                    return 1;
                } else {
                    return 0;
                }
            });
            return sortedArr;
        });
    }, [schedule]);


    // calculates column span value based on a section's start time and end time.
    // time is calculated in hours and is multiplied by 2 to cover for the empty
    // string values in the hour array, which represents the half of the hour.
    function calculateColSpan(hour, day) {
        if (hour === '') return 1
        let colspan = 1
        arr.forEach((scheduleCourse) => {
            const section = scheduleCourse.section
            if (section.meetingDays === day && parseInt(hour) === parseInt(section.meetingTimes[0].meetingTimeStart.substring(0, 2))) {

                const startTime = section.meetingTimes[0].meetingTimeStart.split(':')
                const endTime = section.meetingTimes[0].meetingTimeEnd.split(':')
                const startHour = startTime[0]
                const startMin = startTime[1]
                const endHour = endTime[0]
                const endMin = endTime[1]

                const timeInHours = (((endHour - startHour) * 60) + Math.abs(endMin - startMin)) / 60

                colspan = timeInHours * 2

                return
            }
        })

        return colspan === 0 ? 1 : colspan
    }

    const headerStyle = {
        width: '8em',
        padding: '1em 0.5em 1em 0.5em',
        border: '1px solid #ddd'
    }

    return (
        //height: size ? '700px' : '350px'
        <TableContainer overflowY={overflow} sx={{ height: height}}>
            <Table variant='simple' border="1" sx={{ tableLayout: 'fixed' }}>
                <Thead>
                    <Tr>
                        <Th sx={headerStyle}>
                            Day/Time
                        </Th>
                        {hours && hours.map((time, index) =>
                            <Th key={`${index}`} sx={headerStyle}>
                                {parseInt(time) ?
                                    parseInt(time) < 11 ? time + ':00 am'
                                        : time + ':00 pm' : null
                                }
                            </Th>
                        )}
                    </Tr>
                </Thead>

                <Tbody>
                    {days.map((day, index) =>
                        <Tr key={`${day}`}>
                            <Th key={`${day}-${index}`} sx={{ height: '75px' }}>
                                {day}
                            </Th>

                            {arr.map((scheduleCourse, index) => {
                                const section = scheduleCourse.section
                                if (index == 0) {
                                    //reset the array back to default value.
                                    hours = [
                                        '8', '', '9', '', '10', '', '11', '',
                                        '12', '', '13', '', '14', '', '15', '', '16',
                                        '', '17', '', '18', '', '19'
                                    ]
                                }

                                const coursesToRender = []

                                for (let i = 0; i < hours.length; i++) {

                                    if (section.meetingDays === day) {
                                        const colspan = calculateColSpan(hours[i], day)

                                        if (parseInt(hours[i]) === parseInt(section.meetingTimes[0].meetingTimeStart.split(':')[0])) {
                                            if (section.meetingTimes[0].meetingTimeStart.split(":")[1] === '30') {
                                                coursesToRender.push((
                                                    <React.Fragment key={section.id}>
                                                        <Td></Td>
                                                        <Td
                                                            colSpan={colspan}
                                                            sx={{ paddingLeft: 0 }}
                                                        >
                                                            <Center
                                                                sx={{
                                                                    width: `${10 * (colspan / 1.667)}rem`,
                                                                    border: '1px solid black',
                                                                    borderRadius: '10px',
                                                                    position: 'relative',
                                                                    bgColor: 'red.300',
                                                                    whiteSpace: 'normal',
                                                                    textAlign: 'center',
                                                                    verticalAlign: 'center',
                                                                    height: '50px',
                                                                    display: 'flex',

                                                                }}>
                                                                <Text
                                                                    sx={{
                                                                        margin: 0,
                                                                        height: '100%',
                                                                        display: 'contents'
                                                                    }}
                                                                >
                                                                    {scheduleCourse.course.title}
                                                                </Text>
                                                            </Center>
                                                        </Td>
                                                    </React.Fragment>
                                                ))

                                                hours.splice(i, Math.ceil(colspan))
                                                break;
                                            } else if (section.meetingTimes[0].meetingTimeStart.split(":")[1] === '15' ||
                                                section.meetingTimes[0].meetingTimeStart.split(":")[1] === '45') {

                                                coursesToRender.push((
                                                    <Td key={`${section.id}-${section.meetingDays}`} colSpan={colspan}
                                                        sx={{ paddingLeft: '45px' }}>
                                                        <Center
                                                            sx={{
                                                                width: `${10 * (colspan / 1.667)}rem`,
                                                                border: '1px solid black',
                                                                borderRadius: '10px',
                                                                position: 'relative',
                                                                bgColor: 'red.300',
                                                                whiteSpace: 'normal',
                                                                textAlign: 'center',
                                                                verticalAlign: 'center',
                                                                height: '50px',
                                                                display: 'flex',

                                                            }}>
                                                            <Text
                                                                sx={{
                                                                    margin: 0, height: '100%', display: 'contents'
                                                                }}>{section.course.title}</Text>
                                                        </Center>
                                                    </Td>))
                                                hours.splice(i, Math.ceil(colspan))
                                                break;
                                            }

                                            coursesToRender.push(
                                                <Td
                                                    key={`${section.id}-${section.meetingDays}`}
                                                    colSpan={colspan}
                                                    sx={{ paddingLeft: 0 }}
                                                >
                                                    <Center
                                                        sx={{
                                                            width: `${10 * (colspan / 1.667)}rem`,
                                                            border: '1px solid black',
                                                            borderRadius: '10px',
                                                            position: 'relative',
                                                            bgColor: 'red.300',
                                                            whiteSpace: 'normal',
                                                            textAlign: 'center',
                                                            verticalAlign: 'center',
                                                            height: '50px',
                                                            display: 'flex',

                                                        }}>
                                                        <Text
                                                            sx={{ margin: 0, height: '100%', display: 'contents' }}
                                                        >
                                                            {scheduleCourse.course.title}
                                                        </Text>
                                                    </Center>
                                                </Td>
                                            )
                                            hours.splice(i, colspan)
                                            break;
                                        } else {
                                            hours.splice(i, 1)
                                            i -= 1
                                            coursesToRender.push(
                                                <Td key={`(${day}-${section.id / hours.length}-${section.id})`}>
                                                    {null}
                                                </Td>
                                            )
                                        }
                                    }

                                }
                                return coursesToRender

                            })}
                        </Tr>)
                    }
                </Tbody>
            </Table>
        </TableContainer>
    )
}

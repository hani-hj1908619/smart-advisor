import { Button, Card, CardBody, CardHeader, Divider, Flex, Heading, Text } from '@chakra-ui/react';
import { router } from "next/router";
import { useEffect, useState } from "react";

export default function UpcomingSemCard({ plan }) {
    const planCourses = plan ? plan[0][0].courses : []

    const [creditHours, setCreditHours] = useState(0)
    useEffect(() => {
        setCreditHours(0)

        for (const planCourse of planCourses) {
            setCreditHours(prevVal => prevVal + planCourse.course.creditHours)
        }
    }, [])
    return (
        <Card size='md' mr={5} sx={{ bgColor: 'gray.50' }}>
            <CardHeader pb={2}>
                <Heading size='md' mb={1}>Fall 2022 Semester Plan</Heading>
                <Flex mb={1} gap={5}>
                    <Text>{creditHours} Credit Hours</Text>
                    <Text>{planCourses.length} Courses</Text>
                </Flex>
                <Divider borderColor={'black'} />
            </CardHeader>

            <CardBody as='b' pt={2}>
                {planCourses.length ?
                    <Flex direction='column' gap={1}>
                        {plan[0][0].courses.map((planCourse) =>
                            <Text key={planCourse.id} fontFamily={"sans-serif"} color='blackAlpha.700' fontSize='sm'>
                                {planCourse.course.title} {planCourse.course.type === 'LC' ? '' : 'Lab'}
                            </Text>
                        )}

                    </Flex>
                    :
                    <Flex direction='column' gap={1}>
                        <Text>No courses planned for this semester.</Text>
                        <Button onClick={() => router.push('/degree-plan')}>Go to degree plan page</Button>
                    </Flex>
                }
            </CardBody>
        </Card>
    )
}